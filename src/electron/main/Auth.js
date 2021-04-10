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
    if (!response.ok) throw new Error("Can't access api.desech.com")
    const json = await response.json()
    if (json.error) throw new Error(json.error)
    return json
  },

  saveTokens (userToken, loginToken) {
    Settings.changeSettings({ userToken, loginToken })
  },

  async loginWithTokens (userToken, loginToken, studioToken) {
    try {
      const url = Config.getConfig('api') + `/user/account?user=${userToken}&login=${loginToken}`
      const user = await this.fetchData(url)
      if (!user.is_premium) EventMain.ipcMainInvoke('mainPremiumPrompt')
      await Cookie.setCookie('accountType', user.account_type)
      EventMain.ipcMainInvoke('mainLoginSuccess', user)
    } catch {
      this.startAuth(studioToken)
    }
  },

  async purchasePremium () {
    const url = `${Config.getConfig('web')}/purchase.html`
    await shell.openExternal(url)
  }
}
