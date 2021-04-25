import en from '../i18n/en.json'
import ro from '../i18n/ro.json'
import electron from 'electron'

export default {
  en: en,
  ro: ro,

  getLocales () {
    return ['en', 'ro']
  },

  getOSLocale () {
    let locale = electron.app.getLocale()
    if (locale.indexOf('-') > 0) locale = locale.substring(0, locale.indexOf('-'))
    if (!this.getLocales().includes(locale)) locale = 'en'
    return locale
  },

  localize (text, vars = null, locale = null) {
    locale = locale || global.locale || 'en'
    // if (!locale) throw new Error('No locale found')
    const index = text.trim()
    return this.localizeIndex(this[locale], index, vars, locale)
  },

  localizeIndex (data, index, vars, locale) {
    if (!data[index]) {
      return index
      // throw new Error(`Element "${index}" does not exist for locale ${locale}`)
    }
    if (!vars) return data[index]
    return this.replaceVars(data[index], vars)
  },

  replaceVars (string, vars) {
    for (const key of Object.keys(vars)) {
      string = string.replaceAll(`{{${key}}}`, vars[key])
    }
    return string
  }
}
