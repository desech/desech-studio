import { ipcMain } from 'electron'
import EventMain from './EventMain.js'
import Cookie from '../lib/Cookie.js'
import Variable from '../lib/Variable.js'

export default {
  addEvents () {
    this.rendererValidateVariableEvent()
    this.rendererCreateVariableEvent()
    this.rendererDeleteVariableEvent()
  },

  rendererValidateVariableEvent () {
    ipcMain.handle('rendererValidateVariable', async (event, name) => {
      return await EventMain.handleEvent(this, 'validateVariable', name)
    })
  },

  rendererCreateVariableEvent () {
    ipcMain.handle('rendererCreateVariable', async (event, data) => {
      return await EventMain.handleEvent(this, 'createVariable', data)
    })
  },

  rendererDeleteVariableEvent () {
    ipcMain.handle('rendererDeleteVariable', async (event, data) => {
      return await EventMain.handleEvent(this, 'deleteVariable', data)
    })
  },

  async validateVariable (name) {
    const folder = await Cookie.getCookie('currentFolder')
    return Variable.validateVariable(name, folder)
  },

  async createVariable (data) {
    const folder = await Cookie.getCookie('currentFolder')
    Variable.createVariable(data, folder)
  },

  async deleteVariable (data) {
    const folder = await Cookie.getCookie('currentFolder')
    Variable.deleteVariable(data, folder)
  }
}
