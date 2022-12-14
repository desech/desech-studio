import { ipcMain, app, shell } from 'electron'
import EventMain from './EventMain.js'
import Cookie from '../lib/Cookie.js'
import Settings from '../lib/Settings.js'
import Plugin from '../lib/Plugin.js'
import Project from '../project/Project.js'
import ProjectCommon from '../project/ProjectCommon.js'
import Electron from '../lib/Electron.js'
import Import from '../import/Import.js'

export default {
  addEvents () {
    this.rendererNewSampleProjectEvent()
    this.rendererInitProjectEvent()
    this.rendererSaveProjectSettingsEvent()
    this.rendererImportFileEvent()
    this.rendererInstallPluginEvent()
    this.rendererRemovePluginEvent()
  },

  rendererNewSampleProjectEvent () {
    ipcMain.handle('rendererNewSampleProject', async (event) => {
      return await EventMain.handleEvent(this, 'newSampleProject')
    })
  },

  rendererInitProjectEvent () {
    ipcMain.handle('rendererInitProject', async (event, data) => {
      return await EventMain.handleEvent(Project, 'initProject', data)
    })
  },

  rendererSaveProjectSettingsEvent () {
    ipcMain.handle('rendererSaveProjectSettings', async (event, folder, settings) => {
      return await EventMain.handleEvent(ProjectCommon, 'saveProjectSettings', folder, settings)
    })
  },

  rendererImportFileEvent () {
    ipcMain.handle('rendererImportFile', async (event, type) => {
      return await EventMain.handleEvent(Import, 'importChooseFile', type)
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

  newSampleProject () {
    // @todo do the sample code
  },

  newProject () {
    EventMain.ipcMainInvoke('mainNewProject')
  },

  async importShowFilePrompt (type) {
    await this.closeProject()
    EventMain.ipcMainInvoke('mainImportFilePrompt', type)
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
