import HelperEvent from '../helper/HelperEvent.js'
import HelperCrypto from '../helper/HelperCrypto.js'
import DialogComponent from '../component/DialogComponent.js'
import HelperDOM from '../helper/HelperDOM.js'

export default {
  getEvents () {
    return {
      click: ['clickContinueAuthEvent', 'clickLogoutEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  async clickContinueAuthEvent (event) {
    if (event.target.classList.contains('dialog-auth-button')) {
      await this.continueAuth(event.target)
    }
  },

  async clickLogoutEvent (event) {
    if (event.target.classList.contains('start-user-logout')) {
      await this.logout()
    }
  },

  async continueAuth (button) {
    button.setAttributeNS(null, 'disabled', '')
    setTimeout(() => {
      button.removeAttributeNS(null, 'disabled')
    }, 2000)
    await window.electron.invoke('rendererFetchAuthDesech', button.dataset.token)
  },

  async logout () {
    await window.electron.invoke('rendererLogoutDesech')
    delete document.body.dataset.email
    this.injectAuthData()
    await this.loadAuth()
  },

  async loadAuth () {
    const dialog = this.loadAuthDialog()
    const token = HelperCrypto.generateHash()
    this.loadAuthButton(dialog, token)
    await this.triggerOpenAuthPage(token)
  },

  loadAuthDialog () {
    return DialogComponent.showDialog({
      body: DialogComponent.getContentHtml('auth', 'body'),
      locked: true
    })
  },

  loadAuthButton (dialog, token) {
    const button = dialog.getElementsByClassName('dialog-auth-button')[0]
    button.dataset.token = token
    // wait 1 second before showing the confirm login button
    setTimeout(() => {
      HelperDOM.show(button)
    }, 1000)
  },

  triggerOpenAuthPage (token) {
    // wait 1 second before opening the browser for login
    return new Promise((resolve, reject) => setTimeout(async () => {
      try {
        await window.electron.invoke('rendererAuthenticateDesech', token)
        resolve()
      } catch (e) {
        reject(e)
      }
    }, 1000))
  },

  injectAuthData () {
    const container = document.getElementsByClassName('start-user')[0]
    if (container && document.body.dataset.email) {
      container.children[0].textContent = document.body.dataset.email
      container.style.visibility = 'visible'
    } else {
      container.style.visibility = 'hidden'
    }
  }
}
