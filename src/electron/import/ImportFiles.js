import fs from 'fs'
import ExtendJS from '../../js/helper/ExtendJS.js'
import File from '../file/File.js'
import HelperFile from '../../js/helper/HelperFile.js'
import FileSave from '../file/FileSave.js'

export default {
  cleanFiles (data) {
    this.removeEmptyEntries(data)
    this.unifyFolderToFile(data)
    this.renameFirstFileToIndex(data)
  },

  // some imports have folders, some have just files
  removeEmptyEntries (data) {
    if (Object.values(data)[0].type === 'folder') {
      this.removeEmptyFolders(data)
    } else {
      this.removeEmptyFiles(data)
    }
  },

  removeEmptyFolders (data) {
    for (const folder of Object.keys(data)) {
      this.removeEmptyFiles(data[folder].files)
      if (ExtendJS.isEmpty(data[folder].files)) delete data[folder]
    }
  },

  removeEmptyFiles (files) {
    for (const file of Object.keys(files)) {
      if (!files[file].elements.length) delete files[file]
    }
  },

  // the single folder becomes redundant, so use the files directly
  unifyFolderToFile (data) {
    const first = Object.values(data)[0]
    if (first.type === 'file' || Object.keys(data).length > 1) return
    for (const file of Object.keys(first.files)) {
      data[file] = first.files[file]
    }
    delete data[first.name]
  },

  // take the first file and rename it to index
  renameFirstFileToIndex (data) {
    const keys = Object.keys(data)
    if (data[keys[0]].type === 'file') {
      this.convertFileToIndex(data, keys[0])
    } else { // folder
      this.convertFolderFileToIndex(data)
    }
  },

  convertFileToIndex (data, name) {
    data.index = { ...data[name], name: 'index' }
    delete data[name]
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
