import fs from 'fs'
import File from '../file/File.js'
import ExportStaticContent from './static/ExportStaticContent.js'
import ExportCommon from './ExportCommon.js'

export default {
  async saveToFile (data) {
    const exportDir = File.createFolder(data.folder, '_export')
    await File.syncFolder(data.rootMiscFiles, data.folder, exportDir)
    await this.syncCss(data.folder, data.compiledCss)
    await this.syncJs(data.folder)
    this.syncPages(data.folder, data.htmlFiles, data.compiledCss)
  },

  async syncCss (folder, css) {
    const cssFile = File.resolve(folder, '_export/css/compiled/style.css')
    File.createFile(cssFile, css)
    await this.syncExtraCssFiles(folder)
  },

  // this will sync any custom css files we have
  async syncExtraCssFiles (folder) {
    const source = File.resolve(folder, 'css/general')
    const dest = File.resolve(folder, '_export/css/compiled')
    const files = File.readFolder(source)
    const ignoreFiles = ExportCommon.getFilePaths(ExportCommon.getGeneralCssFiles(), folder)
    await File.syncFolder(files, source, dest, { checkSame: true, ignoreFiles })
  },

  async syncJs (folder) {
    this.createScriptJs(folder)
    await this.syncCustomJs(folder)
  },

  createScriptJs (folder) {
    let js = ''
    const scriptFile = File.resolve(folder, 'js/script.js')
    if (fs.existsSync(scriptFile)) js = File.readFile(scriptFile)
    File.createFile(File.resolve(folder, '_export/js/script.js'), js)
  },

  async syncCustomJs (folder) {
    const files = File.readFolder(File.resolve(folder, 'js'))
    const destFolder = File.resolve(folder, '_export')
    const ignoreFiles = ExportCommon.getFilePaths(ExportCommon.getGeneralJsFiles(), folder)
    await File.syncFolder(files, folder, destFolder, { checkSame: true, ignoreFiles })
  },

  syncPages (folder, htmlFiles, css) {
    for (const file of htmlFiles) {
      if (!file.isComponent) this.syncPage(folder, file.path, css)
    }
  },

  syncPage (folder, filePath, css) {
    const html = ExportStaticContent.getPageHtml(folder, filePath, css)
    const exportFile = folder + '/_export' + filePath.replace(folder, '')
    File.createFile(exportFile, html)
  }
}
