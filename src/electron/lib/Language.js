import en from '../i18n/en.json'
import ro from '../i18n/ro.json'

export default {
  en: en,
  ro: ro,

  localize (text, locale, vars = null) {
    if (!locale) throw new Error('No locale found')
    return this.localizeIndex(this[locale], text.trim(), locale, vars)
  },

  localizeIndex (data, index, locale, vars) {
    if (!data[index]) {
      throw new Error(`Element "${index}" does not exist for locale ${locale}`)
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
