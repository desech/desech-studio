import Electron from '../lib/Electron.js'

export default {
  async handleEvent (obj, method, ...args) {
    try {
      if (!Object.prototype.hasOwnProperty.call(obj, method)) {
        throw new Error(`${method} method doesn't exist`)
      }
      return await obj[method](...args)
    } catch (error) {
      console.error(error)
      this.ipcMainInvoke('mainError', error)
    }
  },

  ipcMainInvoke (name, ...args) {
    Electron.getCurrentWeb().send(name, ...args)
  },

  async executeJs (code) {
    return await Electron.getCurrentWeb().executeJavaScript(code)
  }
}
