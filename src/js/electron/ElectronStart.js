import ElectronCommon from './ElectronCommon.js'
import HelperDOM from '../helper/HelperDOM.js'
import Start from '../start/Start.js'
import DialogComponent from '../component/DialogComponent.js'

export default {
  addEvents () {
    this.mainImportFilePromptEvent()
    this.mainShowFigmaImportEvent()
    this.mainImportProgressEvent()
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
