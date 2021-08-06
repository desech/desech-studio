import fs from 'fs'
import ExtendJS from '../../js/helper/ExtendJS.js'
import File from '../file/File.js'
import HelperFile from '../../js/helper/HelperFile.js'
import FileSave from '../file/FileSave.js'

export default {
  unifyFiles (data) {
    if (ExtendJS.isEmpty(data)) return
    this.unifyFolderToFile(data)
    this.unifyFileToIndex(data)
    this.renameFirstFileToIndex(data)
  },

  unifyFolderToFile (data) {
    const keys = Object.keys(data)
    if (data[keys[0]].type === 'file' || keys.length > 1) return
    // the single folder becomes redundant, so use the files directly
    data = data[keys[0]].files
  },

  unifyFileToIndex (data) {
    const keys = Object.keys(data)
    if (keys.length > 1 || keys[0] === 'index') return
    this.convertToIndexFile(data, keys[0])
  },

  convertToIndexFile (data, name) {
    data.index = { ...data[name], name: 'index' }
    delete data[name]
  },

  renameFirstFileToIndex (data) {
    if (this.haveRootIndexFile(data)) return
    const keys = Object.keys(data)
    if (data[keys[0]].type === 'file') {
      this.convertToIndexFile(data, keys[0])
    } else { // folder
      this.convertFolderFileToIndex(data)
    }
  },

  haveRootIndexFile (html) {
    for (const file of Object.values(html)) {
      if (file.type === 'file' && file.name === 'index') return true
    }
    return false
  },

  convertFolderFileToIndex (data) {
    const folder = Object.keys(data)[0]
    const file = Object.keys(data[folder].files)[0]
    data.index = { ...data[folder].files[file], name: 'index' }
    delete data[folder].files[file]
  },

  saveHtmlFiles (data, params, currentFolder) {
    for (const entry of Object.values(data)) {
      const entryPath = File.resolve(currentFolder, entry.name)
      if (entry.type === 'folder') {
        File.createFolder(entryPath)
        this.saveHtmlFiles(entry.files, params, entryPath)
      } else { // file
        this.saveHtmlFileAndCss(entry.elements, params, entryPath + '.html')
      }
    }
  },

  saveHtmlFileAndCss (elements, params, htmlFile) {
    const html = this.getHtml(elements, params, htmlFile)
    fs.writeFileSync(htmlFile, html)
    const pageCssFile = HelperFile.getPageCssFile(htmlFile, params.folder)
    const pageCss = this.prepareCss(this._tmpFileCss)
    FileSave.saveStyleToFile(pageCss, css.color, params.folder, `css/page/${pageCssFile}`)
  }
}
