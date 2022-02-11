import StateCommandExec from './command/StateCommandExec.js'
import ExtendJS from '../helper/ExtendJS.js'
import HelperTrigger from '../helper/HelperTrigger.js'
import StateSelectedElement from './StateSelectedElement.js'

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

  async executeCommand (data, reload = {}) {
    if (typeof StateCommandExec[data.command] !== 'function') {
      throw new Error(`Unknown command "${data.command}"`)
    }
    await StateCommandExec[data.command](data)
    StateSelectedElement.clearInvalidSelected()
    this.reloadContainers(reload)
  },

  reloadContainers (data) {
    this.initReload(data)
    if (data.elementOverlay) HelperTrigger.triggerReload('element-overlay')
    if (data.rightPanel) HelperTrigger.triggerReload('right-panel')
    if (data.leftPanels) {
      HelperTrigger.triggerReload('sidebar-left-panel', { panels: data.leftPanels })
    }
  },

  // reload: { elementOverlay, leftPanels: ['file', element', 'variable'], rightPanel }
  initReload (data) {
    if (!('elementOverlay' in data)) data.elementOverlay = true
    if (!('rightPanel' in data)) data.rightPanel = false
    if (!('leftPanels' in data)) data.leftPanels = ['element', 'variable']
  }
}
