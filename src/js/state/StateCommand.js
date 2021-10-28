import StateCommandExec from './command/StateCommandExec.js'
import ExtendJS from '../helper/ExtendJS.js'
import HelperTrigger from '../helper/HelperTrigger.js'
import StateSelectedElement from './StateSelectedElement.js'
import CanvasElementSelect from '../main/canvas/element/CanvasElementSelect.js'
import HelperElement from '../helper/HelperElement.js'

export default {
  _DELAY: 250, // ms
  _timeout: null,
  _command: null,

  async stackCommand (command) {
    if (!this._command) {
      this.setCommand(command)
    } else if (this.isSameCommand(command.do) &&
      performance.now() - this._command.time < this._DELAY) {
      this._command.do = command.do
      this._command.time = performance.now()
    } else {
      this.pushCommand()
      this.setCommand(command)
    }
    await this.restartTimeout()
  },

  setCommand (command) {
    this._command = command
    this._command.time = performance.now()
  },

  isSameCommand (doCommand) {
    return (doCommand.command === 'changeStyle' &&
      doCommand.selector === this._command.do.selector &&
      ExtendJS.arraysEqual(Object.keys(doCommand.properties),
        Object.keys(this._command.do.properties)))
  },

  restartTimeout () {
    return new Promise(resolve => {
      this.clearTimeout()
      this._timeout = setTimeout(() => {
        this.pushCommand()
        resolve()
      }, this._DELAY)
    })
  },

  clearTimeout () {
    if (this._timeout) {
      clearTimeout(this._timeout)
      this._timeout = null
    }
  },

  pushCommand () {
    if (ExtendJS.isEmpty(this._command)) return false
    const event = new CustomEvent('pushcommand', {
      detail: this._command,
      bubbles: true,
      cancelable: true
    })
    this._command = null
    document.getElementById('command-history').dispatchEvent(event)
    return true
  },

  forcePushCommand () {
    this.clearTimeout()
    return this.pushCommand()
  },

  async executeCommand (data, overlayReload = true, panelReload = false) {
    if (typeof StateCommandExec[data.command] !== 'function') {
      throw new Error(`Unknown command "${data.command}"`)
    }
    await StateCommandExec[data.command](data)
    this.clearInvalidSelected()
    if (overlayReload) this.reloadContainers(panelReload)
  },

  clearInvalidSelected () {
    const selected = StateSelectedElement.getElement(false)
    if (selected && !HelperElement.isCanvasElement(selected)) {
      CanvasElementSelect.deselectElement()
    }
  },

  reloadContainers (panelReload) {
    HelperTrigger.triggerReload('element-overlay', { panelReload })
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'element' })
  }
}
