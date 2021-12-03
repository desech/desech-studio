import ElectronCommon from './ElectronCommon.js'
import HelperDOM from '../helper/HelperDOM.js'
import Start from '../start/Start.js'
import Auth from '../start/Auth.js'
import DialogComponent from '../component/DialogComponent.js'
import TopCommandCommon from '../main/top/command/TopCommandCommon.js'

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
    window.electron.on('mainImportProgress', (event, html, type, folder) => {
      ElectronCommon.handleEvent(this, 'importProgress', html, type, folder)
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
      await TopCommandCommon.executeSaveFile()
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

  importProgress (html, type, folder) {
    if (!document.getElementById('page-start')) return
    const dialog = this.initDialogImport(type)
    if (!dialog) return
    const list = dialog.getElementsByClassName('loader-progress')[0]
    this.injectProgressText(list, html)
    if (folder) this.markImportFinished(dialog, folder)
  },

  initDialogImport (type) {
    const dialog = document.getElementsByClassName('dialog-import')[0]
    if (dialog) return dialog
    DialogComponent.closeAllDialogs()
    return Start.showImportDialog(type)
  },

  injectProgressText (list, html) {
    const li = document.createElement('li')
    li.innerHTML = html
    list.appendChild(li)
    li.scrollIntoView()
  },

  markImportFinished (dialog, folder) {
    HelperDOM.hide(dialog.getElementsByClassName('progress-loader')[0])
    const button = dialog.getElementsByClassName('dialog-import-finished')[0]
    button.dataset.folder = folder
    HelperDOM.show(button)
  }
}
