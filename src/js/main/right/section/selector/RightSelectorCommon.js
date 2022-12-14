import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import HelperStyle from '../../../../helper/HelperStyle.js'
import StateCommand from '../../../../state/StateCommand.js'
import HelperTrigger from '../../../../helper/HelperTrigger.js'
import HelperLocalStore from '../../../../helper/HelperLocalStore.js'

export default {
  async linkClass (selector) {
    const ref = StateSelectedElement.getRef()
    const cls = HelperStyle.extractClassSelector(selector)
    await this.callLinkCommand(ref, cls, 'linkClass', 'unlinkClass')
    this.saveNewCurrentSelector(selector)
    this.reloadSection()
  },

  async unlinkClass (selector) {
    const ref = StateSelectedElement.getRef()
    const cls = HelperStyle.extractClassSelector(selector)
    await this.callLinkCommand(ref, cls, 'unlinkClass', 'linkClass')
    this.resetCurrentSelector()
    this.reloadSection()
  },

  reloadSection () {
    HelperTrigger.triggerReload('selector-section')
    HelperTrigger.triggerReload('sub-style-sections')
  },

  async callLinkCommand (ref, cls, doCommand, undoCommand) {
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
    await StateCommand.executeCommand(command.do)
  },

  getRecordBySelector (container, selector) {
    const query = `.selector-element[data-selector="${CSS.escape(selector)}"`
    return container.querySelector(query)
  },

  selectSelector (record, container = document) {
    this.activateSelector(record, container)
    this.updateCurrentSelector(record)
    HelperTrigger.triggerReload('sub-style-sections')
  },

  activateSelector (record, container) {
    const active = container.querySelector('.selector-element.active')
    if (active) active.classList.remove('active')
    if (record) record.classList.add('active')
  },

  updateCurrentSelector (record) {
    const ref = StateSelectedElement.getRef()
    const key = `current-selector-${ref}`
    if (record.parentNode.classList.contains('default-selector-list')) {
      HelperLocalStore.removeItem(key)
    } else {
      HelperLocalStore.setItem(key, record.dataset.selector)
    }
  },

  saveNewCurrentSelector (selector) {
    const ref = StateSelectedElement.getRef()
    const key = `current-selector-${ref}`
    HelperLocalStore.setItem(key, selector)
  },

  resetCurrentSelector () {
    const ref = StateSelectedElement.getRef()
    const key = `current-selector-${ref}`
    HelperLocalStore.removeItem(key)
  }
}
