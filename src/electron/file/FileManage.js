import fs from 'fs'
import Cookie from '../lib/Cookie.js'
import HelperFile from '../../js/helper/HelperFile.js'
import Language from '../lib/Language.js'
import ProjectCommon from '../project/ProjectCommon.js'
import File from './File.js'

export default {
  async validateMove (oldPath, newPath) {
    const root = await Cookie.getCookie('currentFolder')
    await this.validateCreate(newPath)
    const isPathComponent = HelperFile.isFolderFile(newPath, 'component', root)
    // @todo apply this to folders with pages/components too for the oldPath
    if (HelperFile.isPageFile(oldPath, root) && isPathComponent) {
      throw new Error(Language.localize("You can't convert pages to components"))
    }
    if (HelperFile.isComponentFile(oldPath, root) && !isPathComponent) {
      throw new Error(Language.localize("Can't move components outside the component folder"))
    }
  },

  async validateCreate (newPath) {
    if (fs.existsSync(newPath)) {
      throw new Error(Language.localize('File/folder already exists with that name'))
    }
  },

  async manageMove (oldPath, newPath) {
    const root = await Cookie.getCookie('currentFolder')
    const isPathComponent = HelperFile.isFolderFile(oldPath, 'component', root)
    if (File.isDir(oldPath)) {
      const files = File.readFolder(oldPath)
      await this.manageFolderMove(files, oldPath, newPath, root, isPathComponent)
    } else {
      await this.manageFileMove(File.readFileEntry(oldPath), newPath, root, isPathComponent)
    }
  },

  async manageFolderMove (files, oldFolderPath, newFolderPath, root, isPathComponent) {
    for (const file of files) {
      const newPath = file.path.replace(oldFolderPath, newFolderPath)
      await this.manageFileMove(file, newPath, root, isPathComponent)
    }
  },

  async manageFileMove (file, newPath, root, isPathComponent) {
    if (file.type === 'file' && file.extension === 'html' && !isPathComponent) {
      await this.managePageMove(file.path, newPath, root)
    } else if (file.type === 'file' && file.extension === 'html' && isPathComponent) {
      await this.manageComponentMove(file.path, newPath, root)
    } else if (file.type === 'file') {
      await this.manageMediaMove(file.path, newPath, root)
    } else {
      await this.manageFolderMove(file.children, file.path, newPath, root, isPathComponent)
    }
  },

  async managePageMove (oldPath, newPath, root) {
    this.updatePageCssFile(oldPath, newPath, root)
    // we can't update the <a href=""> links because they can start with a slash or without
    // and we need to be as specific as possible when doing the regex replace,
    // otherwise we can wrongly change component file data or application text
  },

  updatePageCssFile (oldPath, newPath, root) {
    const oldCssFile = HelperFile.getPageCssFile(oldPath, root)
    const newCssFile = HelperFile.getPageCssFile(newPath, root)
    File.renamePath(File.resolve(root, 'css/page', oldCssFile), newCssFile)
    this.updatePageCssLink(oldPath, newPath, newCssFile, root)
  },

  updatePageCssLink (oldPath, newPath, newCssFile, root) {
    const html = fs.readFileSync(oldPath).toString()
    const baseHref = HelperFile.getBaseHref(newPath, root)
    fs.writeFileSync(oldPath, html.replace(/(<base href=")(.*)(">)/, `$1${baseHref}$3`)
      .replace(/(<link rel="stylesheet" href="css\/page\/)(.*\.css)(">)/, `$1${newCssFile}$3`))
  },

  async manageComponentMove (oldPath, newPath, root) {
    const component = File.resolve(root, 'component')
    const oldLink = File.relative(component, oldPath)
    const newLink = File.relative(component, newPath)
    const template = '&quot;file&quot;:&quot;component/XXX&quot;'
    await ProjectCommon.updateHtmlFiles(root, async (file, html) => {
      return html.replaceAll(template.replace('XXX', oldLink), template.replace('XXX', newLink))
    })
  },

  async manageMediaMove (oldPath, newPath, root) {
    await this.updateMediaInFiles('updateHtmlFiles', oldPath, newPath, root)
    await this.updateMediaInFiles('updateCssFiles', oldPath, newPath, root)
  },

  async updateMediaInFiles (fnc, oldPath, newPath, root) {
    const oldLink = File.relative(root, oldPath)
    const newLink = File.relative(root, newPath)
    await ProjectCommon[fnc](root, async (file, html) => {
      return html.replaceAll(oldLink, newLink)
    })
  },

  async manageDelete (file) {
    const root = await Cookie.getCookie('currentFolder')
    const isPathComponent = HelperFile.isFolderFile(file, 'component', root)
    if (File.isDir(file)) {
      await this.manageFolderDelete(File.readFolder(file), root, isPathComponent)
    } else {
      await this.manageFileDelete(File.readFileEntry(file), root, isPathComponent)
    }
  },

  async manageFolderDelete (files, root, isPathComponent) {
    for (const file of files) {
      await this.manageFileDelete(file, root, isPathComponent)
    }
  },

  async manageFileDelete (file, root, isPathComponent) {
    if (file.type === 'file' && file.extension === 'html' && !isPathComponent) {
      await this.managePageDelete(file.path, root)
    } else if (file.type === 'file' && file.extension === 'html' && isPathComponent) {
      // @todo remove all component references and store them in localstore so we can undo
      // right now when you load a page with a missing component, it will remove it and after
      // it is saved, then the component will be completely removed
    } else if (file.type === 'file') {
      // do nothing
    } else {
      await this.manageFolderDelete(file.children, root, isPathComponent)
    }
  },

  async managePageDelete (filePath, root) {
    const cssFile = HelperFile.getPageCssFile(filePath, root)
    await File.sendToTrash(root + '/css/page/' + cssFile)
  }
}
