import ElectronCommon from './ElectronCommon.js'
import Plugin from '../start/Plugin.js'

export default {
  addEvents () {
    this.mainOpenPluginsEvent()
    this.mainSettingsEvent()
  },

  mainOpenPluginsEvent () {
    window.electron.on('mainOpenPlugins', (event) => {
      ElectronCommon.handleEvent(Plugin, 'openPlugins')
    })
  },

  mainSettingsEvent () {
    window.electron.on('mainSettings', (event, data) => {
      ElectronCommon.handleEvent(this, 'setSettings', data)
    })
  },

  setSettings (data) {
    document.body.dataset.theme = data.settings.theme || 'light'
    document.body.dataset.plugins = JSON.stringify(data.plugins)
  }
}
