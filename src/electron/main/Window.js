import { app, BrowserWindow } from 'electron'
import Menu from './Menu.js'
import Settings from '../lib/Settings.js'
import Log from '../lib/Log.js'
import EventError from '../event/EventError.js'
import EventMenu from '../event/EventMenu.js'
import EventFile from '../event/EventFile.js'
import EventMain from '../event/EventMain.js'
import EventApi from '../event/EventApi.js'
import Plugin from '../lib/Plugin.js'
import File from '../file/File.js'

export default {
  _window: null,

  getWindow () {
    return this._window
  },

  async launchWindow () {
    this.createWindow()
    if (!app.isPackaged) await this.setDevEnvironment()
    await this.loadWindow()
    this.windowEvents()
  },

  createWindow () {
    this._window = new BrowserWindow({
      webPreferences: {
        preload: File.resolve(app.getAppPath(), 'preload.js')
      }
    })
    this._window.maximize()
  },

  async setDevEnvironment () {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true
    await this._window.webContents.session.clearCache()
    this.openDevTools()
  },

  openDevTools () {
    this._window.webContents.openDevTools()
  },

  async loadWindow () {
    try {
      const settings = await this.prepareWindow()
      await this._window.loadFile(`html/${settings.locale}.html`)
      await Log.setInstanceId()
      EventMain.ipcMainInvoke('mainSettings', settings)
    } catch (error) {
      await Log.error(error)
    }
  },

  async prepareWindow () {
    // we don't want the plugins update to stop the electron loading
    Plugin.initPlugins()
    const settings = Settings.initSettings()
    global.locale = settings.locale
    Menu.setMenu()
    this.addEvents()
    return settings
  },

  addEvents () {
    EventError.addEvents()
    EventMenu.addEvents()
    EventFile.addEvents()
    EventApi.addEvents()
  },

  windowEvents () {
    this.stopNavigation()
    this.setThemeOnReload()
    this.cleanup()
    this.logCrash()
  },

  stopNavigation () {
    this._window.webContents.on('will-navigate', (event) => {
      event.preventDefault()
    })
    this._window.webContents.on('new-window', (event) => {
      event.preventDefault()
    })
  },

  setThemeOnReload () {
    this._window.webContents.on('did-finish-load', () => {
      const settings = Settings.initSettings()
      EventMain.ipcMainInvoke('mainSettings', settings)
    })
  },

  cleanup () {
    this._window.on('closed', () => {
      this._window = null
    })
  },

  logCrash () {
    this._window.on('unresponsive', async (event) => {
      await Log.error(new Error('Window crashed'))
    })

    this._window.webContents.on('did-fail-load', async (event, errorCode, errorDescription) => {
      await Log.error(new Error(`Window failed to load contents; ${errorDescription}`))
    })
  }
}
