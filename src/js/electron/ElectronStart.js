import ElectronCommon from './ElectronCommon.js'
import HelperDOM from '../helper/HelperDOM.js'
import Start from '../start/Start.js'
import Auth from '../start/Auth.js'

export default {
  addEvents () {
    this.mainLoginSuccessEvent()
    this.mainImportFilePromptEvent()
    this.mainShowFigmaImportEvent()
    this.mainImportProgressEvent()
  },

  mainLoginSuccessEvent () {
    window.electron.on('mainLoginSuccess', (event, user) => {
      ElectronCommon.handleEvent(this, 'loginSuccess', user)
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
    const button = container.getElementsByClassName('dialog-import-finished')[0]
    button.dataset.folder = folder
    HelperDOM.show(button)
  },

  loginSuccess (user) {
    const dialog = document.getElementsByClassName('dialog')[0]
    if (dialog) dialog.remove()
    document.body.dataset.email = user.email
    Auth.injectAuthData()
  }
}
