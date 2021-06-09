import HelperEvent from '../../../helper/HelperEvent.js'
import TopCommand from '../TopCommand.js'
import StyleSheetFile from '../../../state/stylesheet/StyleSheetFile.js'
import StateHtmlFile from '../../../state/html/StateHtmlFile.js'
import HelperCanvas from '../../../helper/HelperCanvas.js'
import HelperProject from '../../../helper/HelperProject.js'

export default {
  _AUTOSAVE_TIME: 60 * 1000, // in ms

  getEvents () {
    return {
      click: ['clickSaveEvent'],
      keydown: ['keydownSaveEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  async keydownSaveEvent (event) {
    if (event.key && HelperCanvas.getMain() && event.key.toLowerCase() === 's' &&
      HelperEvent.isCtrlCmd(event) && !event.shiftKey && !event.altKey) {
      await this.save()
    }
  },

  async clickSaveEvent (event) {
    if (event.target.closest('#save-button')) {
      await this.save()
    }
  },

  setAutoSaveInterval () {
    return new Promise(resolve => {
      const interval = setInterval(async () => {
        await this.save()
        // we need the interval for unit testing to clear it
        resolve(interval)
      }, this._AUTOSAVE_TIME)
    })
  },

  async save () {
    if (!TopCommand.getList()) return
    const buttons = TopCommand.getButtons()
    this.setSaveLoading(buttons.save, buttons.command)
    await this.saveCurrentFile(buttons.save)
  },

  setSaveLoading (button, command) {
    button.classList.replace('active', 'loading')
    button.classList.replace('inactive', 'loading')
    button.dataset.commandid = command.dataset.id
  },

  async saveCurrentFile (button) {
    await window.electron.invoke('rendererSaveCurrentFile', this.getCurrentFileData())
    button.classList.replace('loading', 'inactive')
    TopCommand.updateButtonStates()
  },

  getCurrentFileData () {
    const folder = HelperProject.getFolder()
    const htmlFile = HelperProject.getFile()
    const css = StyleSheetFile.getStyle()
    const html = StateHtmlFile.getHtml(htmlFile, css)
    return { folder, htmlFile, html, css }
  }
}
