import { ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import EventMain from './EventMain.js'
import Cookie from '../lib/Cookie.js'
import File from '../file/File.js'
import FileParse from '../file/FileParse.js'
import FileSave from '../file/FileSave.js'
import ParseHtml from '../file/parse/ParseHtml.js'
import HelperFile from '../../js/helper/HelperFile.js'
import Font from '../lib/Font.js'

export default {
  addEvents () {
    this.rendererGetFolderEvent()
    this.rendererMoveToFolderEvent()
    this.rendererCreateFolderEvent()
    this.rendererCopyFileEvent()
    this.rendererCreateFileEvent()
    this.rendererRenamePathEvent()
    this.rendererParseHtmlCssFileEvent()
    this.rendererParseComponentFileEvent()
    this.rendererSaveCurrentFileEvent()
    this.rendererAddFontEvent()
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

  async getFolder () {
    const folder = await Cookie.getCookie('currentFolder')
    return File.readFolder(folder, {
      sort: true,
      ignoreFiles: HelperFile.getIgnoredFileFolders()
    })
  },

  async moveToFolder (from, to) {
    const newPath = File.moveToFolder(from, to)
    if (path.extname(from) === '.html') await this.updateCssFile(from, newPath)
  },

  async renamePath (file, name) {
    const newPath = File.renamePath(file, name)
    if (path.extname(file) === '.html') await this.updateCssFile(file, newPath)
  },

  async updateCssFile (oldPath, newPath) {
    const folder = await Cookie.getCookie('currentFolder')
    const oldCssFile = HelperFile.getPageCssFile(oldPath, folder)
    const newCssFile = HelperFile.getPageCssFile(newPath, folder)
    File.renamePath(path.resolve(folder, 'css/page', oldCssFile), newCssFile)
    this.updateMovedHtml(newPath, oldCssFile, newCssFile, folder)
  },

  updateMovedHtml (htmlFile, oldCssFile, newCssFile, folder) {
    const html = fs.readFileSync(htmlFile).toString()
    const baseHref = HelperFile.getBaseHref(htmlFile, folder)
    fs.writeFileSync(htmlFile, html.replace(/(<base href=")(.*)(">)/, `$1${baseHref}$3`)
      .replace(/(<link rel="stylesheet" href="css\/page\/)(.*\.css)(">)/, `$1${newCssFile}$3`))
  }
}
