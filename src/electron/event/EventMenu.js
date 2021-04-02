import { ipcMain, dialog, app, shell } from 'electron'
import EventMain from './EventMain.js'
import Language from '../lib/Language.js'
import Cookie from '../lib/Cookie.js'
import Settings from '../lib/Settings.js'
import File from '../file/File.js'
import Figma from '../import/Figma.js'
import Generic from '../import/Generic.js'
import Plugin from '../lib/Plugin.js'
import Project from '../project/Project.js'
import ProjectCommon from '../project/ProjectCommon.js'
import Electron from '../lib/Electron.js'

export default {
  addEvents () {
    this.rendererNewTutorialProjectEvent()
    this.rendererNewProjectEvent()
    this.rendererOpenProjectEvent()
    this.rendererSaveProjectSettingsEvent()
    this.rendererImportFileEvent()
    this.rendererInstallPluginEvent()
    this.rendererRemovePluginEvent()
    this.rendererGetDesignSystemCssEvent()
  },

  rendererNewTutorialProjectEvent () {
    ipcMain.handle('rendererNewTutorialProject', async (event, locale) => {
      return await EventMain.handleEvent(this, 'newTutorialProject', locale)
    })
  },

  rendererNewProjectEvent () {
    ipcMain.handle('rendererNewProject', async (event, locale) => {
      return await EventMain.handleEvent(this, 'newProject', locale)
    })
  },

  rendererOpenProjectEvent () {
    ipcMain.handle('rendererOpenProject', async (event, locale, settings, folder) => {
      return await EventMain.handleEvent(this, 'openProject', locale, settings, folder)
    })
  },

  rendererSaveProjectSettingsEvent () {
    ipcMain.handle('rendererSaveProjectSettings', async (event, folder, settings) => {
      return await EventMain.handleEvent(Project, 'saveProjectSettings', folder, settings)
    })
  },

  rendererImportFileEvent () {
    ipcMain.handle('rendererImportFile', async (event, type) => {
      return await EventMain.handleEvent(this, 'importFile', type)
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

  newTutorialProject () {
    if (!this.isAuthenticated()) return
    console.log('tutorial')
  },

  newProject () {
    if (!this.isAuthenticated()) return
    const plugins = Plugin.getInstalledPlugins()
    EventMain.ipcMainInvoke('mainNewProject', plugins)
  },

  async openProject (locale, newSettings = null, folder = null) {
    if (!this.isAuthenticated()) return
    // the folder is when we are importing and we already have it
    if (!folder) {
      const folders = this.getChooseFolder(locale)
      if (!folders) return
      folder = File.sanitizePath(folders[0])
    }
    await Project.openProject(folder, newSettings)
  },

  getChooseFolder (locale) {
    return dialog.showOpenDialogSync(Electron.getCurrentWindow(), {
      title: Language.localize('Open a folder / project', locale),
      buttonLabel: Language.localize('Open folder', locale),
      properties: ['openDirectory', 'createDirectory']
    })
  },

  async importFilePrompt (type) {
    if (!this.isAuthenticated()) return
    await this.closeProject()
    EventMain.ipcMainInvoke('mainImportFilePrompt', type)
  },

  async importFile (type) {
    if (!this.isAuthenticated()) return
    if (type === 'sketch' || type === 'adobexd') {
      return await Generic.importFile(type)
    } else if (type === 'figma') {
      return await Figma.showImportFile()
    }
  },

  async openProjectSettings () {
    const settings = await ProjectCommon.getProjectSettings()
    if (!settings) return
    const plugins = Plugin.getInstalledPlugins()
    EventMain.ipcMainInvoke('mainOpenProjectSettings', settings, plugins)
  },

  async closeProject () {
    const currentFolder = await Cookie.getCookie('currentFolder')
    if (!currentFolder) return
    await Cookie.removeCookie('currentFolder')
    EventMain.ipcMainInvoke('mainCloseProject')
  },

  async exportFolder (locale) {
    const currentFolder = await Cookie.getCookie('currentFolder')
    if (!currentFolder) return
    const folders = this.getExportFolder(locale)
    if (!folders) return
    const zipFolder = File.sanitizePath(folders[0])
    await File.exportFolder(zipFolder, currentFolder)
  },

  getExportFolder (locale) {
    return dialog.showOpenDialogSync(Electron.getCurrentWindow(), {
      title: Language.localize('Save zip file', locale),
      buttonLabel: Language.localize('Save file', locale),
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

  async openPlugins () {
    const plugins = await Plugin.getAllPlugins()
    EventMain.ipcMainInvoke('mainOpenPlugins', plugins)
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
