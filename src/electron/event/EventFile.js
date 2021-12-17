import { ipcMain } from 'electron'
import fs from 'fs'
import { JSDOM } from 'jsdom'
import EventMain from './EventMain.js'
import Cookie from '../lib/Cookie.js'
import File from '../file/File.js'
import FileParse from '../file/FileParse.js'
import FileSave from '../file/FileSave.js'
import ParseHtml from '../file/parse/ParseHtml.js'
import HelperFile from '../../js/helper/HelperFile.js'
import Font from '../lib/Font.js'
import FileManage from '../file/FileManage.js'
import HelperComponent from '../../js/helper/HelperComponent.js'
import ProjectCommon from '../project/ProjectCommon.js'

export default {
  addEvents () {
    this.rendererGetFileContentsEvent()
    this.rendererGetFolderEvent()
    this.rendererMoveToFolderEvent()
    this.rendererCreateFolderEvent()
    this.rendererCopyFileEvent()
    this.rendererCreateFileEvent()
    this.rendererRenamePathEvent()
    this.rendererDeletePathEvent()
    this.rendererParseHtmlCssFileEvent()
    this.rendererParseComponentFileEvent()
    this.rendererSaveCurrentFileEvent()
    this.rendererAddFontEvent()
    this.rendererSaveComponentDataEvent()
    this.rendererRenameVariantEvent()
  },

  rendererGetFileContentsEvent () {
    ipcMain.handle('rendererGetFileContents', async (event, file) => {
      return await EventMain.handleEvent(File, 'readFile', file)
    })
  },

  rendererGetFolderEvent () {
    ipcMain.handle('rendererGetFolder', async (event) => {
      return await EventMain.handleEvent(this, 'getFolder')
    })
  },

  rendererMoveToFolderEvent () {
    ipcMain.handle('rendererMoveToFolder', async (event, from, to) => {
      return await EventMain.handleEvent(this, 'moveToFolder', from, to)
    })
  },

  rendererCreateFolderEvent () {
    ipcMain.handle('rendererCreateFolder', async (event, data) => {
      return await EventMain.handleEvent(this, 'createFolder', data)
    })
  },

  rendererCopyFileEvent () {
    ipcMain.handle('rendererCopyFile', async (event, data) => {
      return await EventMain.handleEvent(this, 'copyFile', data)
    })
  },

  rendererCreateFileEvent () {
    ipcMain.handle('rendererCreateFile', async (event, data) => {
      return await EventMain.handleEvent(this, 'createFile', data)
    })
  },

  rendererRenamePathEvent () {
    ipcMain.handle('rendererRenamePath', async (event, file, name) => {
      return await EventMain.handleEvent(this, 'renamePath', file, name)
    })
  },

  rendererDeletePathEvent () {
    ipcMain.handle('rendererDeletePath', async (event, file) => {
      return await EventMain.handleEvent(this, 'deletePath', file)
    })
  },

  rendererParseHtmlCssFileEvent () {
    ipcMain.handle('rendererParseHtmlCssFile', async (event, file) => {
      return await EventMain.handleEvent(FileParse, 'parseHtmlCssFile', file)
    })
  },

  rendererParseComponentFileEvent () {
    ipcMain.handle('rendererParseComponentFile', async (event, data) => {
      return await EventMain.handleEvent(ParseHtml, 'parseComponentFile', data)
    })
  },

  rendererSaveCurrentFileEvent () {
    ipcMain.handle('rendererSaveCurrentFile', async (event, data) => {
      return await EventMain.handleEvent(FileSave, 'saveCurrentFile', data)
    })
  },

  rendererAddFontEvent () {
    ipcMain.handle('rendererAddFont', async (event, url, file) => {
      return await EventMain.handleEvent(Font, 'addFont', url, file)
    })
  },

  rendererSaveComponentDataEvent () {
    ipcMain.handle('rendererSaveComponentData', async (event, file, data) => {
      return await EventMain.handleEvent(this, 'saveComponentData', file, data)
    })
  },

  rendererRenameVariantEvent () {
    ipcMain.handle('rendererRenameVariant', async (event, file, data) => {
      return await EventMain.handleEvent(this, 'renameVariant', file, data)
    })
  },

  async createFolder (data) {
    const folder = File.resolve(data.root, data.folder)
    await FileManage.validateCreate(folder)
    File.createFolder(data.root, data.folder)
  },

  async copyFile (data) {
    const name = data.name || File.basename(data.file)
    const newPath = File.resolve(data.root, name)
    await FileManage.validateCreate(newPath)
    File.copyFileIfMissing(data)
  },

  async createFile (data) {
    await FileManage.validateCreate(data.file)
    File.createFileIfMissing(data.file, data.contents)
    return true
  },

  async getFolder () {
    const folder = await Cookie.getCookie('currentFolder')
    return File.readFolder(folder, {
      sort: true,
      ignoreFiles: HelperFile.getIgnoredFileFolders()
    })
  },

  // @todo implement undo for files too
  async moveToFolder (oldPath, to) {
    to = File.isDir(to) ? to : File.dirname(to)
    const newPath = File.resolve(to, File.basename(oldPath))
    await FileManage.validateMove(oldPath, newPath)
    await FileManage.manageMove(oldPath, newPath)
    fs.renameSync(oldPath, newPath)
  },

  async renamePath (file, name) {
    if (File.basename(file) === name || !fs.existsSync(file)) return
    const newPath = File.resolve(File.dirname(file), name)
    await FileManage.validateCreate(newPath)
    await FileManage.manageMove(file, newPath)
    fs.renameSync(file, newPath)
  },

  async deletePath (file) {
    await FileManage.manageDelete(file)
    await File.sendToTrash(file)
  },

  saveComponentData (file, data) {
    const html = File.readFile(file)
    const dom = new JSDOM(html)
    const root = dom.window.document.body.children[0]
    HelperComponent.setMainComponentData(root, data)
    fs.writeFileSync(file, root.outerHTML)
  },

  async renameVariant (componentFile, data) {
    const root = await Cookie.getCookie('currentFolder')
    await ProjectCommon.updateHtmlFiles(root, async (file, html) => {
      return html.replace(/(data-ss-component=")(.*?)(")/g, (match, x1, component, x2) => {
        const json = JSON.parse(component.replaceAll('&quot;', '"'))
        this.renameVariantInInstance(componentFile, json, data, file)
        return x1 + JSON.stringify(json).replaceAll('"', '&quot;') + x2
      })
    })
  },

  renameVariantInInstance (componentFile, json, data, file) {
    // only process component instances
    // the main component data was changed in `rendererSaveComponentData`
    if (!json.file || componentFile !== json.file || !json?.variants) return
    json.variants[data.name] = data.value
    if (data.name !== data.oldName && json.variants[data.oldName]) {
      delete json.variants[data.oldName]
    }
  }
}
