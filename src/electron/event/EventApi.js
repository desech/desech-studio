import { ipcMain } from 'electron'
import EventMain from './EventMain.js'
import Import from '../import/Import.js'
import Auth from '../main/Auth.js'
import Figma from '../import/Figma.js'

export default {
  addEvents () {
    this.rendererImportFigmaFileEvent()
    this.rendererFetchFigmaEvent()
    this.rendererAuthenticateDesechEvent()
    this.rendererFetchAuthDesechEvent()
    this.rendererLogoutDesechEvent()
  },

  rendererImportFigmaFileEvent () {
    ipcMain.handle('rendererImportFigmaFile', async (event, file, token, locale) => {
      return await EventMain.handleEvent(Import, 'importFile', {
        type: 'figma', file, token, locale
      })
    })
  },

  rendererFetchFigmaEvent () {
    ipcMain.handle('rendererFetchFigma', async (event) => {
      return await EventMain.handleEvent(Figma, 'fetchToken')
    })
  },

  rendererAuthenticateDesechEvent () {
    ipcMain.handle('rendererAuthenticateDesech', async (event, token) => {
      return await EventMain.handleEvent(Auth, 'authenticateDesech', token)
    })
  },

  rendererFetchAuthDesechEvent () {
    ipcMain.handle('rendererFetchAuthDesech', async (event, token) => {
      return await EventMain.handleEvent(Auth, 'fetchAuthDesech', token)
    })
  },

  rendererLogoutDesechEvent () {
    ipcMain.handle('rendererLogoutDesech', async (event) => {
      return await EventMain.handleEvent(Auth, 'logoutDesech')
    })
  }
}
