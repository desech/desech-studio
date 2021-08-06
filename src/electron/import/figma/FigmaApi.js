import { shell } from 'electron'
import fetch from 'node-fetch'
import Config from '../../lib/Config.js'
import Settings from '../../lib/Settings.js'
import EventMain from '../../event/EventMain.js'
import Auth from '../../main/Auth.js'
import Language from '../../lib/Language.js'
import FigmaCommon from './FigmaCommon.js'

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
    const url = Config.getConfig('api') + '/user/tokens-fetch?user=' +
      Settings.getSetting('userToken') + '&login=' + Settings.getSetting('loginToken')
    return await Auth.fetchData(url)
  },

  startAuth () {
    const url = Config.getConfig('api') + '/user/figma?user=' +
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
    const res = await this.getResponse(method, token)
    const json = await res.json()
    if (json.error) this.error(json.message, res, method)
    if (json.err) this.error(json.err, res, method)
    return json
  },

  async getResponse (method, token) {
    const headers = { headers: { Authorization: `Bearer ${token}` } }
    const url = `https://api.figma.com/v1/${method}`
    const response = await fetch(url, headers)
    if (!response.ok) throw new Error(Language.localize("Can't access api.figma.com"))
    return response
  },

  error (error, res, method) {
    throw new Error(`Url: ${method}, Status: ${res.status}, Error: ${error}`)
  }
}
