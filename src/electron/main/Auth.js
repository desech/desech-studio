import { shell } from 'electron'
import Settings from '../lib/Settings.js'
import Config from '../lib/Config.js'
import EventMain from '../event/EventMain.js'
import Cookie from '../lib/Cookie.js'
import Fetch from '../lib/Fetch.js'

export default {
  async authenticateDesech (studioToken) {
    const userToken = Settings.getSetting('userToken')
    const loginToken = Settings.getSetting('loginToken')
    if (!userToken || !loginToken) return this.startAuth(studioToken)
    await this.loginWithTokens(userToken, loginToken, studioToken)
  },

  async fetchAuthDesech (studioToken) {
    const url = Config.getConfig('api') + '/user/studio-fetch?token=' + studioToken
    const data = await Fetch.fetch(url)
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

  saveTokens (userToken, loginToken) {
    Settings.changeSettings({ userToken, loginToken })
  },

  async loginWithTokens (userToken, loginToken, studioToken) {
    try {
      const url = Config.getConfig('api') + `/user/account?user=${userToken}&login=${loginToken}`
      const user = await Fetch.fetch(url)
      if (!user.active_subscription) EventMain.ipcMainInvoke('mainPremiumPrompt')
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
