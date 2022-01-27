import HelperEvent from '../../../helper/HelperEvent.js'
import TopCommand from '../TopCommand.js'
import HelperCanvas from '../../../helper/HelperCanvas.js'
import HelperProject from '../../../helper/HelperProject.js'
import HelperElement from '../../../helper/HelperElement.js'
import HelperComponent from '../../../helper/HelperComponent.js'
import HelperFile from '../../../helper/HelperFile.js'
import TopCommandCommon from './TopCommandCommon.js'

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
        await this.save(true)
        // we need the interval for unit testing to clear it
        resolve(interval)
      }, this._AUTOSAVE_TIME)
    })
  },

  async save (checkAlreadySaved = false) {
    if (!HelperProject.getFile()) return
    const buttons = TopCommand.getButtons()
    if (checkAlreadySaved && !buttons.save.classList.contains('active')) {
      return
    }
    this.validateElements()
    this.setSaveLoading(buttons.save, buttons.command)
    await this.saveCurrentFile(buttons.save)
  },

  validateElements () {
    if (HelperFile.isPageFile()) return
    const nodes = this.getTopElements()
    if (!nodes.length) {
      throw new Error('At least one element is required')
    } else if (nodes.length > 1) {
      throw new Error('Only one top/root level element is allowed. ' +
        `Please delete the other ${nodes.length - 1}`)
    } else if (HelperComponent.isComponent(nodes[0])) {
      throw new Error('Components are not allowed as the top/root element')
    } else if (HelperElement.isUnrender(nodes[0])) {
      throw new Error("The top/root element can't be unrendered")
    }
  },

  getTopElements () {
    const nodes = []
    for (const node of HelperCanvas.getCanvas().children) {
      if (HelperElement.isCanvasElement(node)) {
        nodes.push(node)
      }
    }
    return nodes
  },

  setSaveLoading (button, command) {
    button.classList.replace('active', 'loading')
    button.classList.replace('inactive', 'loading')
    button.dataset.commandid = command.dataset.id
  },

  async saveCurrentFile (button) {
    await TopCommandCommon.executeSaveFile()
    // saving can take a long time and we might not even be inside the project
    if (!HelperProject.getFile()) return
    button.classList.replace('loading', 'inactive')
    TopCommand.updateButtonStates()
  }
}
