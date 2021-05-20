import ElectronCommon from './ElectronCommon.js'
import HelperDOM from '../helper/HelperDOM.js'
import Start from '../start/Start.js'
import Auth from '../start/Auth.js'
import DialogComponent from '../component/DialogComponent.js'
import TopCommandSave from '../main/top/command/TopCommandSave.js'

export default {
  addEvents () {
    this.mainLoginSuccessEvent()
    this.mainPremiumPromptEvent()
    this.mainImportFilePromptEvent()
    this.mainShowFigmaImportEvent()
    this.mainImportProgressEvent()
  },

  mainLoginSuccessEvent () {
    window.electron.on('mainLoginSuccess', (event, user) => {
      ElectronCommon.handleEvent(this, 'loginSuccess', user)
    })
  },

  mainPremiumPromptEvent () {
    window.electron.on('mainPremiumPrompt', (event) => {
      ElectronCommon.handleEvent(this, 'triggerPremiumPrompt')
    })
  },

  mainImportFilePromptEvent () {
    window.electron.on('mainImportFilePrompt', (event, type) => {
      ElectronCommon.handleEvent(Start, 'importFilePrompt', type)
    })
  },

  mainImportProgressEvent () {
    window.electron.on('mainImportProgress', (event, msg, folder) => {
      ElectronCommon.handleEvent(this, 'importProgress', msg, folder)
    })
  },

  mainShowFigmaImportEvent () {
    window.electron.on('mainShowFigmaImport', (event, token) => {
      ElectronCommon.handleEvent(Start, 'switchImportToFigma', token)
    })
  },

  loginSuccess (user) {
    const dialog = document.getElementsByClassName('dialog')[0]
    if (dialog) dialog.remove()
    document.body.dataset.email = user.email
    Auth.injectAuthData()
  },

  triggerPremiumPrompt () {
    // 30 minutes
    setTimeout(async () => {
      await TopCommandSave.save()
      this.showPremiumPrompt()
    }, 1000 * 60 * 30)
  },

  showPremiumPrompt () {
    const dialog = DialogComponent.showDialog({
      header: DialogComponent.getContentHtml('premium', 'header'),
      body: DialogComponent.getContentHtml('premium', 'body'),
      footer: DialogComponent.getContentHtml('premium', 'footer'),
      locked: true
    })
    this.randomizePromptButtons(dialog)
  },

  randomizePromptButtons (dialog) {
    const container = dialog.querySelector('.dialog-footer')
    for (let i = container.children.length; i >= 0; i--) {
      container.appendChild(container.children[Math.random() * i | 0])
    }
  },

  importProgress (html, folder) {
    HelperDOM.hide(document.getElementsByClassName('dialog-figma-continue'))
    const list = document.querySelector('.dialog-import .loader-progress')
    if (!list) return
    this.injectProgressText(list, html)
    if (folder) this.markImportFinished(list.closest('.dialog-import-loader'), folder)
  },

  injectProgressText (list, html) {
    const li = document.createElement('li')
    li.innerHTML = html
    list.appendChild(li)
    li.scrollIntoView()
  },

  markImportFinished (container, folder) {
    HelperDOM.hide(container.getElementsByClassName('svg-loader')[0])
    const button = container.getElementsByClassName('dialog-import-finished')[0]
    button.dataset.folder = folder
    HelperDOM.show(button)
  }
}
