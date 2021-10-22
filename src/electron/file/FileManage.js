import fs from 'fs'
import Cookie from '../lib/Cookie.js'
import HelperFile from '../../js/helper/HelperFile.js'
import Language from '../lib/Language.js'
import ProjectCommon from '../project/ProjectCommon.js'

export default {
  async validateMove (oldPath, newPath) {
    const root = await Cookie.getCookie('currentFolder')
    const isPathComponent = HelperFile.isFolderFile(newPath, 'component', root)
    // @todo apply this to folders with pages/components too
    if (HelperFile.isPageFile(oldPath, root) && isPathComponent) {
      throw new Error(Language.localize("You can't convert pages to components"))
    }
    if (HelperFile.isComponentFile(oldPath, root) && !isPathComponent) {
      throw new Error(Language.localize("Can't move components outside the component folder"))
    }
  },

  async validateRename (oldPath, newPath) {
    if (!newPath) {
      throw new Error(Language.localize('File/folder already exists with that name'))
    }
  },

  async manageMove (oldPath, newPath) {
    const root = await Cookie.getCookie('currentFolder')
    const isPathComponent = HelperFile.isFolderFile(newPath, 'component', root)
    await this.managePathMove(File.readFolder(oldPath), newPath, root, isPathComponent)
  },

  async managePathMove (files, newPath, root, isPathComponent) {
    for (const file of files) {
      if (file.type === 'file' && file.extension === 'html' && !isPathComponent) {
        await this.managePageMove(file, newPath, root)
      } else if (file.type === 'file' && file.extension === 'html' && isPathComponent) {
        await this.manageComponentMove(file, newPath, root)
      } else if (file.type === 'file') {
        await this.manageMediaMove(file, newPath, root)
      } else {
        await this.managePathMove(file.children, newPath, root, isPathComponent)
      }
    }
  },

  async managePageMove (oldPath, newPath, root) {
    this.updatePageCssFile(oldPath, newPath, root)
    await this.updateLinkHtml(oldPath, newPath, root)
  },

  updatePageCssFile (oldPath, newPath, root) {
    const oldCssFile = HelperFile.getPageCssFile(oldPath, root)
    const newCssFile = HelperFile.getPageCssFile(newPath, root)
    File.renamePath(File.resolve(root, 'css/page', oldCssFile), newCssFile)
    this.updatePageCssLink(newPath, oldCssFile, newCssFile, root)
  },

  updatePageCssLink (htmlFile, oldCssFile, newCssFile, root) {
    const html = fs.readFileSync(htmlFile).toString()
    const baseHref = HelperFile.getBaseHref(htmlFile, root)
    fs.writeFileSync(htmlFile, html.replace(/(<base href=")(.*)(">)/, `$1${baseHref}$3`)
      .replace(/(<link rel="stylesheet" href="css\/page\/)(.*\.css)(">)/, `$1${newCssFile}$3`))
  },

  async manageComponentMove (oldPath, newPath, root) {
    const component = File.resolve(root, 'component')
    const oldLink = File.relative(component, oldPath)
    const newLink = File.relative(component, newPath)
    const template = '&quot;,&quot;file&quot;:&quot;component/XXX&quot;'
    await ProjectCommon.updateHtmlFiles(root, async (file, html) => {
      return html.replace(template.replace('XXX', oldLink), template.replace('XXX', newLink))
    })
  },

  async manageMediaMove (oldPath, newPath, root) {
    await this.updateLinkHtml(oldPath, newPath, root)
    await this.updateLinkCss(oldPath, newPath, root)
  },

  async updateLinkHtml (oldPath, newPath, root) {
    const oldLink = File.relative(root, oldPath)
    const newLink = File.relative(root, newPath)
    await ProjectCommon.updateHtmlFiles(root, async (file, html) => {
      return html.replace(oldLink, newLink)
    })
  },

  async updateLinkCss (oldPath, newPath, root) {
    const oldLink = File.relative(root, oldPath)
    const newLink = File.relative(root, newPath)
    await ProjectCommon.updateCssFiles(root, async (file, html) => {
      return html.replace(oldLink, newLink)
    })
  },

  async manageDelete (file) {
    const root = await Cookie.getCookie('currentFolder')
    const isPathComponent = HelperFile.isFolderFile(file, 'component', root)
    await this.managePathDelete(File.readFolder(file), root, isPathComponent)
  },

  async managePathDelete (files, root, isPathComponent) {
    for (const file of files) {
      if (file.type === 'file' && file.extension === 'html' && !isPathComponent) {
        await this.managePageDelete(file, root)
      } else if (file.type === 'file' && file.extension === 'html' && isPathComponent) {
        await this.manageComponentDelete(file, root)
      } else if (file.type === 'file') {
        // do nothing
      } else {
        await this.managePathDelete(file.children, root, isPathComponent)
      }
    }
  },

  async managePageDelete (file, root) {
    const cssFile = HelperFile.getPageCssFile(file, root)
    await File.sendToTrash(root + '/css/page/' + cssFile)
  },

  async manageComponentDelete (file, root) {
    const oldLink = File.relative(root, file)
    await ProjectCommon.updateHtmlFiles(root, async (file, html) => {
      // <div class="component" data-ss-component="">(.*?)?<\/div>
      return html.replace(oldLink, newLink)
    })
  }
}
