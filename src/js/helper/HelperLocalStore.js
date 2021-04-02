import ExtendJS from './ExtendJS.js'

export default {
  clearStore () {
    localStorage.clear()
  },

  getItem (key) {
    const string = localStorage.getItem(key)
    return ExtendJS.parseJsonNoError(string)
  },

  setItem (key, value) {
    const check = (typeof value === 'object' || Array.isArray(value))
    const string = check ? JSON.stringify(value) : value
    localStorage.setItem(key, string)
  },

  removeItem (key) {
    localStorage.removeItem(key)
  },

  removeAllTemporary () {
    const persistent = this.getPersistentSettings()
    for (const key of Object.keys(localStorage)) {
      if (!persistent.includes(key)) this.removeItem(key)
    }
  },

  getPersistentSettings () {
    return ['panel-file-expand', 'right-html-details-expand', 'top-canvas-zoom-level']
  }
}
