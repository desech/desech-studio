import { ipcMain } from 'electron'
import Log from '../lib/Log.js'

export default {
  addEvents () {
    this.rendererErrorEvent()
  },

  rendererErrorEvent () {
    ipcMain.handle('rendererError', async (event, error, type = 'error') => {
      await this.rendererError(error, type)
    })
  },

  async rendererError (error, type = 'error') {
    if (type === 'error') {
      await Log.error(error)
    } else if (type === 'warn') {
      await Log.warn(error)
    }
  }
}
