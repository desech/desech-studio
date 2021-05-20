import DialogComponent from '../component/DialogComponent.js'

export default {
  error (error, customError = null) {
    console.error(error)
    window.electron.invoke('rendererError', this.getErrorObj(error), 'error') // async
    this.showDialog(customError || error)
  },

  warn (error) {
    console.warn(error)
    window.electron.invoke('rendererError', this.getErrorObj(error), 'warn') // async
  },

  getErrorObj (error) {
    // we only pass the stack because sometimes the error object can't be passed through electron
    return { stack: error.stack || error.message }
  },

  showDialog (error) {
    const dialog = this.showOverlay()
    const container = dialog.getElementsByClassName('error-message')[0]
    container.textContent = error.message
  },

  showOverlay () {
    return DialogComponent.showDialog({
      header: DialogComponent.getContentHtml('error', 'header'),
      body: DialogComponent.getContentHtml('error', 'body')
    })
  }
}
