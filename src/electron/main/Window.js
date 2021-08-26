import fs from 'fs'
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
    await this.showInitialWindow()
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

  async showInitialWindow () {
    this._window.removeMenu() // only linux, windows
    const file = File.resolve(app.getAppPath(), 'html/loading.html')
    const html = fs.readFileSync(file).toString()
    await this._window.loadURL(`data:text/html;charset=utf-8,${html}`)
  },

  async loadWindow () {
    try {
      const data = await this.getData()
      this.prepareWindow(data)
      await this._window.loadFile(`html/${data.settings.locale}.html`)
      await Log.setInstanceId()
      EventMain.ipcMainInvoke('mainSettings', data)
    } catch (error) {
      await Log.error(error)
      await this.showFatalError(error)
    }
  },

  async showFatalError (error) {
    // @todo make this use localization too
    this._window.removeMenu() // only linux, windows
    const file = File.resolve(app.getAppPath(), 'html/error.html')
    const html = fs.readFileSync(file).toString().replace('{{ERROR}}', error)
    await this._window.loadURL(`data:text/html;charset=utf-8,${html}`)
  },

  async getData () {
    const settings = Settings.initSettings()
    const plugins = await Plugin.getAllPlugins()
    return { settings, plugins }
  },

  prepareWindow (data) {
    Plugin.initPlugins() // don't use await
    global.locale = data.settings.locale
    Menu.setMenu()
    this.addEvents()
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
    this._window.webContents.on('did-finish-load', async () => {
      const data = await this.getData()
      EventMain.ipcMainInvoke('mainSettings', data)
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
