import HelperDOM from '../../helper/HelperDOM.js'
import StateCommand from '../../state/StateCommand.js'
import HelperEvent from '../../helper/HelperEvent.js'

export default {
  _MAX_COMMANDS: 50,

  getEvents () {
    return {
      click: ['clickUndoEvent', 'clickRedoEvent'],
      keydown: ['keydownUndoEvent', 'keydownRedoEvent'],
      pushcommand: ['pushcommandEvent']
    }
  },

  pushcommandEvent (event) {
    if (event.target.id === 'command-history') {
      this.pushCommand(event.detail)
    }
  },

  async keydownUndoEvent (event) {
    if (event.key && HelperEvent.areMainShortcutsAllowed(event) &&
      event.key.toLowerCase() === 'z' && HelperEvent.isCtrlCmd(event) && !event.shiftKey &&
      !event.altKey) {
      await this.undo()
    }
  },

  async clickUndoEvent (event) {
    if (event.target.closest('#undo-button')) {
      await this.undo()
    }
  },

  async keydownRedoEvent (event) {
    if (event.key && HelperEvent.areMainShortcutsAllowed(event) &&
      event.key.toLowerCase() === 'z' && HelperEvent.isCtrlCmd(event) && event.shiftKey &&
      !event.altKey) {
      await this.redo()
    }
  },

  async clickRedoEvent (event) {
    if (event.target.closest('#redo-button')) {
      await this.redo()
    }
  },

  pushCommand (data) {
    this.removeNextCommands()
    const element = this.addCommand(data)
    this.setCurrentCommand(element)
    this.removeExcessCommands()
    this.updateButtonStates()
  },

  removeNextCommands () {
    const nodes = this.getList().getElementsByClassName('next')
    HelperDOM.deleteNodes(nodes)
  },

  getList () {
    return document.getElementById('command-history')
  },

  addCommand (data) {
    const element = this.getCommandTemplate(data.do.command)
    this.setCommandData(element, data)
    this.getList().appendChild(element)
    return element
  },

  getCommandTemplate (name) {
    const template = HelperDOM.getTemplate('template-command')
    const command = template.querySelector(`li[data-command="${name}"]`)
    if (!command) throw new Error(`No command template "${name}"`)
    return command
  },

  setCommandData (element, data) {
    element.dataset.id = this.getNextCommandId()
    element.dataset.data = JSON.stringify(data)
  },

  getNextCommandId () {
    const current = this.getCurrentCommand()
    return parseInt(current.dataset.id) + 1
  },

  getCurrentCommand () {
    return this.getList().getElementsByClassName('current-command')[0]
  },

  setCurrentCommand (element) {
    element.className = 'current-command'
    this.setPreviousCommands(element)
    this.setNextCommands(element)
    // the container must have visibility hidden not display one
    element.scrollIntoView()
  },

  setPreviousCommands (current) {
    let element = current.previousElementSibling
    while (element) {
      element.className = 'previous'
      element = element.previousElementSibling
    }
  },

  setNextCommands (current) {
    let element = current.nextElementSibling
    while (element) {
      element.className = 'next'
      element = element.nextElementSibling
    }
  },

  removeExcessCommands () {
    const list = this.getList()
    if (list.children.length > this._MAX_COMMANDS) {
      // don't delete the first child, because it's the `No changes` default element
      list.children[1].remove()
    }
  },

  updateButtonStates () {
    const buttons = this.getButtons()
    const cmd = buttons.command
    this.setButtonState(buttons.undo, cmd.previousElementSibling)
    this.setButtonState(buttons.redo, cmd.nextElementSibling)
    this.setButtonState(buttons.save, buttons.save.dataset.commandid !== cmd.dataset.id)
  },

  getButtons () {
    return {
      undo: document.getElementById('undo-button'),
      redo: document.getElementById('redo-button'),
      save: document.getElementById('save-button'),
      command: this.getList().getElementsByClassName('current-command')[0]
    }
  },

  setButtonState (button, activate) {
    if (activate) {
      button.classList.replace('inactive', 'active')
    } else {
      button.classList.replace('active', 'inactive')
    }
  },

  async undo () {
    // push the command that's in the stack, waiting to be dispatched
    StateCommand.forcePushCommand()
    const current = this.getCurrentCommand()
    if (!current.previousElementSibling) return
    await this.goToCommand(current, current.previousElementSibling, 'undo')
  },

  async redo () {
    // push the command that's in the stack, waiting to be dispatched
    StateCommand.forcePushCommand()
    const current = this.getCurrentCommand()
    if (!current.nextElementSibling) return
    await this.goToCommand(current, current.nextElementSibling, 'do')
  },

  async goToCommand (current, other, dataType) {
    this.setCurrentCommand(other)
    const data = JSON.parse(dataType === 'undo' ? current.dataset.data : other.dataset.data)
    // we do want to reload the side panel
    await StateCommand.executeCommand(data[dataType], true, true)
    this.updateButtonStates()
  }
}
