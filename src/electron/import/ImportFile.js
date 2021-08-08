import fs from 'fs'
import File from '../file/File.js'
import HelperFile from '../../js/helper/HelperFile.js'
import FileSave from '../file/FileSave.js'
import ExtendJS from '../../js/helper/ExtendJS.js'
import ImportHtml from './ImportHtml.js'
import ImportCss from './ImportCss.js'

export default {
  cleanFiles (data) {
    this.renameFirstFileToIndex(data)
    this.removeEmptyFiles(data)
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

  removeEmptyFiles (data) {
    for (const entry of Object.values(data)) {
      if (entry.type === 'folder') {
        if (!ExtendJS.isEmpty(data[entry.name].files)) {
          this.removeEmptyFiles(data[entry.name].files)
        }
        if (ExtendJS.isEmpty(data[entry.name].files)) {
          delete data[entry.name]
        }
      } else if (!data[entry.name].elements.length) {
        delete data[entry.name]
      }
    }
  },

  saveAllHtmlCssFiles (data, params) {
    this.processFolders(data, params, params.folder)
  },

  processFolders (data, params, currentFolder) {
    for (const entry of Object.values(data)) {
      const entryPath = File.resolve(currentFolder, entry.name)
      if (entry.type === 'folder') {
        File.createFolder(entryPath)
        this.processFolders(entry.files, params, entryPath)
      } else { // file
        this.saveHtmlCssFile(entry, params, entryPath + '.html')
      }
    }
  },

  saveHtmlCssFile (entry, params, htmlFile) {
    // data.body will contain the body element with all its children
    const data = ImportHtml.processHtml(entry.elements, params, htmlFile)
    fs.writeFileSync(htmlFile, data.html)
    const pageCssFile = HelperFile.getPageCssFile(htmlFile, params.folder)
    const pageCss = ImportCss.processCss(data.body, params)
    FileSave.saveStyleToFile(pageCss, null, params.folder, `css/page/${pageCssFile}`)
  }
}
