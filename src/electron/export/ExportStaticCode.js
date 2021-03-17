import fs from 'fs'
import path from 'path'
import File from '../file/File.js'
import ExportStaticContent from './static/ExportStaticContent.js'

export default {
  async saveToFile (data) {
    await this.syncFolders(data.folder)
    this.syncFavicon(data.folder)
    this.syncCss(data.folder)
    this.syncJs(data.folder)
    this.syncPages(data.folder)
  },

  async syncFolders (folder) {
    for (const dir of ['asset', 'font']) {
      const source = path.resolve(folder, dir)
      await this.syncFiles(source, folder + '/_export/' + dir)
    }
  },

  async syncFiles (source, dest) {
    File.createMissingDir(dest)
    const fileTree = File.readFolder(source)
    await File.syncFolder(fileTree, source, dest, true)
  },

  syncFavicon (folder) {
    const icon = path.resolve(folder, 'favicon.ico')
    if (fs.existsSync(icon)) {
      fs.copyFileSync(icon, folder + '/_export/favicon.ico')
    }
  },

  syncCss (folder) {
    let css = this.getCssContent(this.getGeneralCssFiles(folder))
    css += '\n' + this.getCssContent(this.getPageCssFiles(folder))
    const cssFile = path.resolve(folder, '_export/css/compiled/style.css')
    File.createFile(cssFile, css)
  },

  getGeneralCssFiles (folder) {
    const paths = []
    // order matters
    const files = ['reset', 'animation', 'font', 'design-system', 'root', 'component-css',
      'component-html']
    for (const file of files) {
      const filePath = path.resolve(folder, 'css/general', file + '.css')
      if (fs.existsSync(filePath)) paths.push(filePath)
    }
    return paths
  },

  getPageCssFiles (folder) {
    const paths = []
    const files = File.readFolder(path.resolve(folder, 'css/page'))
    for (const file of files) {
      if (file.extension === 'css') paths.push(file.path)
    }
    return paths
  },

  getCssContent (files) {
    let css = ''
    for (const file of files) {
      css += css ? '\n' : ''
      css += fs.readFileSync(file).toString()
    }
    return css
  },

  syncJs (folder) {
    const scriptFile = folder + '/_export/js/script.js'
    if (!fs.existsSync(scriptFile)) File.createFile(scriptFile)
    const dsFile = path.resolve(folder, 'js/design-system.js')
    if (fs.existsSync(dsFile)) {
      fs.copyFileSync(dsFile, folder + '/_export/js/design-system.js')
    }
  },

  syncPages (folder) {
    const files = this.getHtmlFiles(folder)
    for (const file of files) {
      this.syncPage(folder, file.path)
    }
  },

  getHtmlFiles (folder) {
    const files = File.readFolder(folder)
    const list = []
    this.addHtmlFolderFiles(files, list, folder)
    return list
  },

  addHtmlFolderFiles (files, list, folder) {
    for (const file of files) {
      if (file.type === 'folder' && !this.checkAllowedHtmlFolder(file.name)) {
        continue
      }
      if (file.type === 'folder') this.addHtmlFolderFiles(file.children, list, folder)
      if (file.extension !== 'html') continue
      list.push(file)
    }
  },

  checkAllowedHtmlFolder (name) {
    const ignore = ['asset', 'component', 'css', 'font', 'js', '_desech', '_export']
    for (const val of ignore) {
      if (name === val) return false
    }
    return true
  },

  syncPage (folder, filePath) {
    const html = ExportStaticContent.getPageHtml(folder, filePath)
    const exportFile = folder + '/_export' + filePath.replace(folder, '')
    File.createFile(exportFile, html)
  }
}
