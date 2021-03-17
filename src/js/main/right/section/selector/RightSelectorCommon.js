import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import HelperStyle from '../../../../helper/HelperStyle.js'
import StateCommand from '../../../../state/StateCommand.js'
import HelperTrigger from '../../../../helper/HelperTrigger.js'

export default {
  linkClass (selector) {
    const ref = StateSelectedElement.getRef()
    const cls = HelperStyle.extractClassSelector(selector)
    this.callLinkCommand(ref, cls, 'linkClass', 'unlinkClass')
    this.reloadSection(selector)
    HelperTrigger.triggerReload('sub-style-sections')
  },

  unlinkClass (selector) {
    const ref = StateSelectedElement.getRef()
    const cls = HelperStyle.extractClassSelector(selector)
    this.callLinkCommand(ref, cls, 'unlinkClass', 'linkClass')
    this.reloadSection()
    HelperTrigger.triggerReload('sub-style-sections')
  },

  callLinkCommand (ref, cls, doCommand, undoCommand) {
    const command = {
      do: {
        command: doCommand,
        ref,
        cls
      },
      undo: {
        command: undoCommand,
        ref,
        cls
      }
    }
    StateCommand.stackCommand(command)
    StateCommand.executeCommand(command.do)
  },

  reloadSection (selector = null) {
    let detail = null
    if (selector) {
      detail = {
        callback: selector => this.reloadSelectCallback(selector),
        arg1: selector
      }
    }
    HelperTrigger.triggerReload('selector-section', detail)
  },

  reloadSelectCallback (selector) {
    const section = document.getElementById('selector-section')
    const query = `.selector-element[data-selector="${CSS.escape(selector)}"`
    const element = section.querySelector(query)
    this.selectSelector(element, section)
  },

  selectSelector (element, container = document) {
    this.activateSelector(element, container)
    HelperTrigger.triggerReload('sub-style-sections')
  },

  activateSelector (element, container) {
    const active = container.querySelector('.selector-element.active')
    if (active) active.classList.remove('active')
    if (element) element.classList.add('active')
  }
}
