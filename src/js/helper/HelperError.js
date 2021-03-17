import DialogComponent from '../component/DialogComponent.js'

export default {
  error (error, customError = null) {
    console.error(error)
    window.electron.invoke('rendererError', { stack: error.stack }, 'error') // async
    this.showDialog(customError || error)
  },

  warn (error) {
    console.warn(error)
    window.electron.invoke('rendererError', { stack: error.stack }, 'warn') // async
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
