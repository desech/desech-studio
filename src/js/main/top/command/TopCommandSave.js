import HelperEvent from '../../../helper/HelperEvent.js'
import TopCommand from '../TopCommand.js'
import StyleSheetFile from '../../../state/stylesheet/StyleSheetFile.js'
import StateHtmlFile from '../../../state/html/StateHtmlFile.js'
import HelperCanvas from '../../../helper/HelperCanvas.js'
import HelperProject from '../../../helper/HelperProject.js'

export default {
  _AUTOSAVE_TIME: 60 * 1000, // in ms
  _FIRST_SAVE_TIME: 3 * 1000,

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
        await this.save(true)
        // we need the interval for unit testing to clear it
        resolve(interval)
      }, this._AUTOSAVE_TIME)
    })
  },

  setFirstSaveTimeout () {
    // save again when we open the project, to make sure we are on the latest reset css file
    // after the import, this also fixes our font-family and generates the first _export folder
    setTimeout(async () => { await this.save() }, this._FIRST_SAVE_TIME)
  },

  async save (check = false) {
    if (!TopCommand.getList()) return
    const buttons = TopCommand.getButtons()
    if (check && !buttons.save.classList.contains('active')) return
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
