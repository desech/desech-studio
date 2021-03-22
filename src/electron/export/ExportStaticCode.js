import fs from 'fs'
import path from 'path'
import File from '../file/File.js'
import ExportStaticContent from './static/ExportStaticContent.js'

export default {
  async saveToFile (data) {
    await File.syncFolder(data.rootMiscFiles, data.folder, path.resolve(data.folder, '_export'))
    this.syncCss(data.folder, data.compiledCss)
    this.syncJs(data.folder)
    this.syncPages(data.folder, data.htmlFiles)
  },

  syncCss (folder, css) {
    const cssFile = path.resolve(folder, '_export/css/compiled/style.css')
    File.createFile(cssFile, css)
  },

  syncJs (folder) {
    const scriptFile = path.resolve(folder, '_export/js/script.js')
    if (!fs.existsSync(scriptFile)) File.createFile(scriptFile)
    const dsFile = path.resolve(folder, 'js/design-system.js')
    if (fs.existsSync(dsFile)) {
      fs.copyFileSync(dsFile, path.resolve(folder, '_export/js/design-system.js'))
    }
  },

  syncPages (folder, htmlFiles) {
    for (const file of htmlFiles) {
      if (!file.isComponent) this.syncPage(folder, file.path)
    }
  },

  syncPage (folder, filePath) {
    const html = ExportStaticContent.getPageHtml(folder, filePath)
    const exportFile = folder + '/_export' + filePath.replace(folder, '')
    File.createFile(exportFile, html)
  }
}
