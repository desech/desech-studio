import fs from 'fs'
import File from '../file/File.js'
import ExportStaticContent from './static/ExportStaticContent.js'

export default {
  async saveToFile (data) {
    const exportDir = File.createFolder(data.folder, '_export')
    await File.syncFolder(data.rootMiscFiles, data.folder, exportDir)
    this.syncCss(data.folder, data.compiledCss)
    this.syncJs(data.folder)
    this.syncPages(data.folder, data.htmlFiles)
  },

  syncCss (folder, css) {
    const cssFile = folder + '/_export/css/compiled/style.css'
    File.createFile(cssFile, css)
  },

  syncJs (folder) {
    const scriptFile = folder + '/_export/js/script.js'
    if (fs.existsSync(scriptFile)) return
    const dsFile = folder + '/js/design-system.js'
    const js = fs.existsSync(dsFile) ? fs.readFileSync(dsFile).toString() : ''
    File.createFile(scriptFile, js)
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
