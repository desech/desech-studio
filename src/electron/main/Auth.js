import { shell } from 'electron'
import fetch from 'node-fetch'
import Settings from '../lib/Settings.js'
import Config from '../lib/Config.js'
import EventMain from '../event/EventMain.js'
import Cookie from '../lib/Cookie.js'

export default {
  async authenticateDesech (studioToken) {
    const userToken = Settings.getSetting('userToken')
    const loginToken = Settings.getSetting('loginToken')
    if (!userToken || !loginToken) return this.startAuth(studioToken)
    await this.loginWithTokens(userToken, loginToken, studioToken)
  },

  async fetchAuthDesech (studioToken) {
    const url = Config.getConfig('api') + '/user/studio-fetch?token=' + studioToken
    const data = await this.fetchData(url)
    if (!data.user_token || !data.login_token) return
    this.saveTokens(data.user_token, data.login_token)
    await this.loginWithTokens(data.user_token, data.login_token, studioToken)
  },

  async logoutDesech () {
    this.saveTokens(null, null)
  },

  startAuth (studioToken) {
    const url = Config.getConfig('web') + '/user/auth.html?studio=' + studioToken
    shell.openExternal(url)
  },

  async fetchData (url) {
    const response = await fetch(url)
    try {
      const json = await response.json()
      if (json.error) throw new Error(json.error)
      return json
    } catch (error) {
      throw new Error(`${error} - ${url}`)
    }
  },

  saveTokens (userToken, loginToken) {
    Settings.changeSettings({ userToken, loginToken })
  },

  async loginWithTokens (userToken, loginToken, studioToken) {
    try {
      const url = Config.getConfig('api') + `/user/account?user=${userToken}&login=${loginToken}`
      const user = await this.fetchData(url)
      await this.sFgK64i4mFWqL7ifDMKMrZfNGCBjZdmzy(user)
      EventMain.ipcMainInvoke('mainLoginSuccess', user)
    } catch {
      this.startAuth(studioToken)
    }
  },

  async sFgK64i4mFWqL7ifDMKMrZfNGCBjZdmzy (user) {
    // @todo change this to the user's plan (free or premium)
    // cookie name to check for user plan type is 'SFCdFt5mwNpe8LguwzYJxP24839pFJLRX'
    // free is 'U2L7HpSR4b4DAEvyittYxtgJRHtG4dDVU'
    // premium is 'Lp4tAMoMg7ThJWf6dvqCgMaioRiASkto4'
    await Cookie.setCookie('SFCdFt5mwNpe8LguwzYJxP24839pFJLRX',
      'U2L7HpSR4b4DAEvyittYxtgJRHtG4dDVU')
  }
}
