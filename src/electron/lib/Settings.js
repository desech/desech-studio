import { app, nativeTheme } from 'electron'
import fs from 'fs'
import path from 'path'

export default {
  _FILE: '',
  _locales: ['en', 'ro'],

  initSettings () {
    this._FILE = path.resolve(app.getPath('userData'), 'settings.json')
    if (!fs.existsSync(this._FILE)) this.createInitialFile()
    return this.getSettings()
  },

  createInitialFile () {
    this.saveToFile({
      locale: this.getOSLocale(),
      theme: nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
    })
  },

  getOSLocale () {
    let locale = app.getLocale()
    if (locale.indexOf('-') > 0) locale = locale.substring(0, locale.indexOf('-'))
    if (!this._locales.includes(locale)) locale = 'en'
    return locale
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
