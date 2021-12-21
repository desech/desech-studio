import ExtendJS from './ExtendJS.js'

export default {
  async getData () {
    const string = await navigator.clipboard.readText()
    return string ? ExtendJS.parseJsonNoError(string) : {}
  },

  async saveData (data) {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
  },

  async clear () {
    await navigator.clipboard.writeText('')
  }
}
