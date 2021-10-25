import { ipcMain } from 'electron'
import fs from 'fs'
import EventMain from './EventMain.js'
import Cookie from '../lib/Cookie.js'
import File from '../file/File.js'
import FileParse from '../file/FileParse.js'
import FileSave from '../file/FileSave.js'
import ParseHtml from '../file/parse/ParseHtml.js'
import HelperFile from '../../js/helper/HelperFile.js'
import Font from '../lib/Font.js'
import FileManage from '../file/FileManage.js'
import FileComponent from '../file/FileComponent.js'

export default {
  addEvents () {
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
    this.rendererCopySvgCodeEvent()
    this.rendererSaveComponentDataEvent()
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
      return await EventMain.handleEvent(File, 'createFolder', data.root, data.folder)
    })
  },

  rendererCopyFileEvent () {
    ipcMain.handle('rendererCopyFile', async (event, data) => {
      return await EventMain.handleEvent(File, 'copyFileIfMissing', data)
    })
  },

  rendererCreateFileEvent () {
    ipcMain.handle('rendererCreateFile', async (event, data) => {
      return await EventMain.handleEvent(File, 'createFileIfMissing', data.file, data.contents)
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
    ipcMain.handle('rendererParseComponentFile', async (event, file) => {
      return await EventMain.handleEvent(ParseHtml, 'parseComponentFile', file)
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

  rendererCopySvgCodeEvent () {
    ipcMain.handle('rendererCopySvgCode', async (event, file) => {
      return await EventMain.handleEvent(this, 'copySvgCode', file)
    })
  },

  rendererSaveComponentDataEvent () {
    ipcMain.handle('rendererSaveComponentData', async (event, file, data) => {
      return await EventMain.handleEvent(FileComponent, 'saveComponentData', file, data)
    })
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
    await FileManage.validateRename(file, newPath)
    await FileManage.manageMove(file, newPath)
    fs.renameSync(file, newPath)
  },

  async deletePath (file) {
    await FileManage.manageDelete(file)
    await File.sendToTrash(file)
  },

  copySvgCode (file) {
    return fs.readFileSync(file).toString()
  }
}
