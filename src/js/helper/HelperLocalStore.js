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

  removeAllBut (exceptions) {
    for (const key of Object.keys(localStorage)) {
      if (!exceptions.includes(key)) this.removeItem(key)
    }
  }
}
