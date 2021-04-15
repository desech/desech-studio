import { app, nativeTheme } from 'electron'
import fs from 'fs'
import path from 'path'
import Language from './Language.js'

export default {
  _FILE: '',

  initSettings () {
    this._FILE = path.resolve(app.getPath('userData'), 'settings.json')
    if (!fs.existsSync(this._FILE)) this.createInitialFile()
    return this.getSettings()
  },

  createInitialFile () {
    this.saveToFile({
      locale: Language.getOSLocale(),
      theme: nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
    })
  },

  saveToFile (json) {
    fs.writeFileSync(this._FILE, JSON.stringify(json, null, 2))
  },

  getSettings () {
    const json = fs.readFileSync(this._FILE)
    return JSON.parse(json)
  },

  getSetting (field) {
    const settings = this.getSettings()
    return settings[field]
  },

  changeSettings (change) {
    const settings = this.getSettings()
    this.setSettings(settings, change)
    this.saveToFile(settings)
  },

  setSettings (settings, change) {
    for (const [key, val] of Object.entries(change)) {
      if (val) {
        settings[key] = val
      } else {
        delete settings[key]
      }
    }
  }
}
