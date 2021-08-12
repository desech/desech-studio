import { ipcMain } from 'electron'
import EventMain from './EventMain.js'
import Auth from '../main/Auth.js'
import FigmaApi from '../import/figma/FigmaApi.js'

export default {
  addEvents () {
    this.rendererAuthenticateDesechEvent()
    this.rendererFetchAuthDesechEvent()
    this.rendererLogoutDesechEvent()
    this.rendererPurchasePremiumEvent()
    this.rendererFetchFigmaEvent()
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
  },

  rendererPurchasePremiumEvent () {
    ipcMain.handle('rendererPurchasePremium', async (event) => {
      return await EventMain.handleEvent(Auth, 'purchasePremium')
    })
  },

  rendererFetchFigmaEvent () {
    ipcMain.handle('rendererFetchFigma', async (event) => {
      return await EventMain.handleEvent(FigmaApi, 'fetchToken')
    })
  }
}
