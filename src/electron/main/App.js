import { app, crashReporter } from 'electron'
import { autoUpdater } from 'electron-updater'
import Window from './Window.js'
import Log from '../lib/Log.js'

export default {
  async bootstrap () {
    this.onCrash()
    await Log.initLogs()
    this.ready()
    this.activate()
    if (app.isPackaged) this.updateEvents()
  },

  onCrash () {
    crashReporter.start({
      submitURL: '',
      uploadToServer: false
    })
  },

  ready () {
    app.on('ready', async () => {
      await Window.launchWindow()
      if (app.isPackaged) autoUpdater.checkForUpdatesAndNotify()
    })
  },

  activate () {
    app.on('activate', async () => {
      if (Window.getWindow() === null) await Window.launchWindow()
    })
  },

  updateEvents () {
    autoUpdater.on('error', async (event, error) => {
      await Log.info('Error in auto-updater: ' + error)
    })

    autoUpdater.on('checking-for-update', async () => {
      await Log.info('Checking for update...')
    })

    autoUpdater.on('update-available', async (event, info) => {
      await Log.info('Update available.')
    })

    autoUpdater.on('update-not-available', async (event, info) => {
      await Log.info('Update not available.')
    })

    autoUpdater.on('download-progress', async (event) => {
      await Log.info('Download progress...')
    })

    autoUpdater.on('update-downloaded', async (event, info) => {
      await Log.info('Update downloaded, prompt for install on exit')
    })
  }
}
