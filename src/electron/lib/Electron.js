import { BrowserWindow } from 'electron'

export default {
  getCurrentWindow () {
    return BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]
  },

  getCurrentWeb () {
    return this.getCurrentWindow().webContents
  },

  reload () {
    this.getCurrentWeb().reload()
  }
}
