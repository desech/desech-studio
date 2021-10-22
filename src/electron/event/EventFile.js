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

  async getFolder () {
    const folder = await Cookie.getCookie('currentFolder')
    return File.readFolder(folder, {
      sort: true,
      ignoreFiles: HelperFile.getIgnoredFileFolders()
    })
  },

  async moveToFolder (from, to) {
    await FileManage.validateMove(from, to)
    const newPath = File.moveToFolder(from, to)
    await FileManage.manageMove(from, newPath)
  },

  async renamePath (file, name) {
    // this returns undefined if the file already exists
    const newPath = File.renamePath(file, name)
    await FileManage.validateRename(file, newPath)
    await FileManage.manageMove(file, newPath)
  },

  async deletePath (file) {
    await File.sendToTrash(file)
    FileManage.manageDelete(file)
  },

  copySvgCode (file) {
    return fs.readFileSync(file).toString()
  }
}
