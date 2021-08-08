import { ipcMain, dialog, app, shell } from 'electron'
import EventMain from './EventMain.js'
import Language from '../lib/Language.js'
import Cookie from '../lib/Cookie.js'
import Settings from '../lib/Settings.js'
import File from '../file/File.js'
import Plugin from '../lib/Plugin.js'
import Project from '../project/Project.js'
import ProjectCommon from '../project/ProjectCommon.js'
import Electron from '../lib/Electron.js'
import Zip from '../file/Zip.js'
import Import from '../import/Import.js'

export default {
  addEvents () {
    this.rendererNewSampleProjectEvent()
    this.rendererInitProjectEvent()
    this.rendererSaveProjectSettingsEvent()
    this.rendererImportFileEvent()
    this.rendererInstallPluginEvent()
    this.rendererRemovePluginEvent()
    this.rendererGetDesignSystemCssEvent()
  },

  rendererNewSampleProjectEvent () {
    ipcMain.handle('rendererNewSampleProject', async (event) => {
      return await EventMain.handleEvent(this, 'newSampleProject')
    })
  },

  rendererInitProjectEvent () {
    ipcMain.handle('rendererInitProject', async (event, data) => {
      return await EventMain.handleEvent(this, 'initProject', data)
    })
  },

  rendererSaveProjectSettingsEvent () {
    ipcMain.handle('rendererSaveProjectSettings', async (event, folder, settings) => {
      return await EventMain.handleEvent(ProjectCommon, 'saveProjectSettings', folder, settings)
    })
  },

  rendererImportFileEvent () {
    ipcMain.handle('rendererImportFile', async (event, type) => {
      return await EventMain.handleEvent(this, 'importChooseFile', type)
    })
  },

  rendererInstallPluginEvent () {
    ipcMain.handle('rendererInstallPlugin', async (event, repoUrl) => {
      return await EventMain.handleEvent(Plugin, 'installPlugin', repoUrl)
    })
  },

  rendererRemovePluginEvent () {
    ipcMain.handle('rendererRemovePlugin', async (event, repoUrl) => {
      return await EventMain.handleEvent(Plugin, 'removePlugin', repoUrl)
    })
  },

  rendererGetDesignSystemCssEvent () {
    ipcMain.handle('rendererGetDesignSystemCss', async (event) => {
      return await EventMain.handleEvent(Project, 'getDesignSystemCss')
    })
  },

  isAuthenticated () {
    return Settings.getSetting('userToken') && Settings.getSetting('loginToken') &&
      Cookie.getCookie('accountType')
  },

  newSampleProject () {
    // if (!this.isAuthenticated()) return
    // @todo do the sample code
  },

  newProject () {
    if (!this.isAuthenticated()) return
    EventMain.ipcMainInvoke('mainNewProject')
  },

  async initProject (data) {
    if (!this.isAuthenticated()) return
    await Project.initProject(data)
  },

  async importShowFilePrompt (type) {
    if (!this.isAuthenticated()) return
    await this.closeProject()
    EventMain.ipcMainInvoke('mainImportFilePrompt', type)
  },

  async importChooseFile (type) {
    if (this.isAuthenticated()) await Import.importChooseFile(type)
  },

  async openProjectSettings () {
    const settings = await ProjectCommon.getProjectSettings()
    if (!settings) return
    EventMain.ipcMainInvoke('mainOpenProjectSettings', settings)
  },

  async closeProject () {
    const currentFolder = await Cookie.getCookie('currentFolder')
    if (!currentFolder) return
    await Cookie.removeCookie('currentFolder')
    EventMain.ipcMainInvoke('mainCloseProject')
  },

  async exportFolder () {
    const currentFolder = await Cookie.getCookie('currentFolder')
    if (!currentFolder) return
    const folders = this.getExportFolder()
    if (!folders) return
    const zipFolder = File.sanitizePath(folders[0])
    await Zip.exportFolder(zipFolder, currentFolder)
  },

  getExportFolder () {
    return dialog.showOpenDialogSync(Electron.getCurrentWindow(), {
      title: Language.localize('Save zip file'),
      buttonLabel: Language.localize('Save file'),
      properties: ['openDirectory', 'createDirectory']
    })
  },

  switchLanguage (locale) {
    Settings.changeSettings({ locale })
    app.relaunch()
    app.exit()
  },

  switchTheme (theme) {
    Settings.changeSettings({ theme })
    Electron.reload()
  },

  openPlugins () {
    EventMain.ipcMainInvoke('mainOpenPlugins')
  },

  openLink (url) {
    shell.openExternal(url)
  },

  showShortcuts () {
    EventMain.ipcMainInvoke('mainShortcuts')
  },

  showAbout () {
    EventMain.ipcMainInvoke('mainAbout')
  }
}
