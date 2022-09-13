import { shell } from 'electron'
import Settings from '../../lib/Settings.js'
import EventMain from '../../event/EventMain.js'
import Language from '../../lib/Language.js'
import FigmaCommon from './FigmaCommon.js'
import Fetch from '../../lib/Fetch.js'

export default {
  async showImportFile () {
    const user = await this.getUserTokens()
    if (user && user.figma_token) {
      EventMain.ipcMainInvoke('mainShowFigmaImport', user.figma_token)
    } else {
      this.startAuth()
    }
  },

  async getUserTokens () {
    const url = 'https://api.desech.com/user/tokens-fetch?user=' +
      Settings.getSetting('userToken') + '&login=' + Settings.getSetting('loginToken')
    return await Fetch.fetch(url)
  },

  startAuth () {
    const url = 'https://api.desech.com/user/figma?user=' +
      Settings.getSetting('userToken') + '&login=' + Settings.getSetting('loginToken')
    shell.openExternal(url)
  },

  async fetchToken () {
    const user = await this.getUserTokens()
    if (user && user.figma_token) {
      EventMain.ipcMainInvoke('mainShowFigmaImport', user.figma_token)
    }
  },

  async apiCall (method, token) {
    FigmaCommon.sendProgress(Language.localize('Fetching <b>{{method}}</b>', { method }))
    const url = `https://api.figma.com/v1/${method}`
    const options = { headers: { Authorization: `Bearer ${token}` } }
    return await Fetch.fetch(url, 'json', options)
  }
}
