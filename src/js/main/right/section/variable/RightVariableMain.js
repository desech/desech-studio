import StateStyleSheet from '../../../../state/StateStyleSheet.js'
import DialogComponent from '../../../../component/DialogComponent.js'
import StateCommand from '../../../../state/StateCommand.js'
import HelperTrigger from '../../../../helper/HelperTrigger.js'
import RightVariableCommon from './RightVariableCommon.js'
import StyleSheetSelector from '../../../../state/stylesheet/StyleSheetSelector.js'
import HelperCanvas from '../../../../helper/HelperCanvas.js'
import HelperVariable from '../../../../helper/HelperVariable.js'
import StateSelectedVariable from '../../../../state/StateSelectedVariable.js'
import HelperEvent from '../../../../helper/HelperEvent.js'

export default {
  getEvents () {
    return {
      focusin: ['focusinUnitSavePreviousValueEvent'],
      change: ['changeCreateVariablePromptEvent', 'changeGotoUpdateVariableEvent'],
      click: ['clickCreateVariableSubmitEvent'],
      keydown: ['keydownDeselectVariableEvent']
    }
  },

  focusinUnitSavePreviousValueEvent (event) {
    if (event.target.classList.contains('input-unit-measure')) {
      event.target.dataset.previous = event.target.value
    }
  },

  changeCreateVariablePromptEvent (event) {
    if (event.target.classList.contains('input-unit-measure') &&
      event.target.value === 'var-desech-input-create') {
      this.createVariablePrompt(event.target)
    }
  },

  changeGotoUpdateVariableEvent (event) {
    if (event.target.classList.contains('input-unit-measure') &&
      event.target.value === 'var-desech-input-update') {
      this.gotoUpdateVariable(event.target)
    }
  },

  async clickCreateVariableSubmitEvent (event) {
    if (event.target.closest('.dialog-create-variable-confirm')) {
      await this.createVariableSubmit(event.target.closest('.dialog'))
    }
  },

  keydownDeselectVariableEvent (event) {
    if (event.key && HelperEvent.areMainShortcutsAllowed(event) &&
      HelperEvent.isNotCtrlAltShift(event) && !HelperCanvas.isPreview() &&
      event.key === 'Escape') {
      StateSelectedVariable.deselectVariable()
    }
  },

  createVariablePrompt (select) {
    this.setSelectData(select)
    const dialog = this.showCreateOverlay()
    const fields = dialog.getElementsByTagName('form')[0].elements
    fields.name.focus()
    fields.property.value = select.dataset.name
  },

  setSelectData (select) {
    select.dataset.action = select.value
    select.value = select.dataset.previous
  },

  showCreateOverlay () {
    return DialogComponent.showDialog({
      header: DialogComponent.getContentHtml('variable-create', 'header'),
      body: DialogComponent.getContentHtml('variable-create', 'body'),
      footer: DialogComponent.getContentHtml('variable-create', 'footer')
    })
  },

  async createVariableSubmit (dialog) {
    const form = dialog.getElementsByTagName('form')[0]
    const input = form.elements.name
    const data = this.getVariableData(form.elements)
    const propertyName = form.elements.property.value
    if (form.checkValidity()) RightVariableCommon.validateName(input, data.name)
    if (form.checkValidity()) await this.finishCreateVariable(dialog, data, propertyName)
    input.reportValidity()
  },

  getVariableData (fields) {
    return {
      ref: HelperVariable.generateVariableRef(),
      name: RightVariableCommon.sanitizeVariable(fields.name.value),
      type: RightVariableCommon.getPropertyType(fields.property.value),
      value: StateStyleSheet.getPropertyValue(fields.property.value)
    }
  },

  async finishCreateVariable (dialog, data, propertyName) {
    DialogComponent.closeDialog(dialog)
    await this.createVariableExec(data, propertyName)
    HelperTrigger.triggerReload('right-panel')
  },

  async createVariableExec (variable, propertyName) {
    const style = this.getStyleData(propertyName)
    const command = {
      do: {
        command: 'createVariable',
        variable,
        style
      },
      undo: {
        command: 'deleteVariable',
        variable,
        style
      }
    }
    StateCommand.stackCommand(command)
    await StateCommand.executeCommand(command.do)
  },

  getStyleData (propertyName) {
    return {
      propertyName,
      selector: StyleSheetSelector.getCurrentSelector()
    }
  },

  gotoUpdateVariable (select) {
    this.setSelectData(select)
    const ref = HelperVariable.getVariableRef(select.previousElementSibling.value)
    StateSelectedVariable.selectVariable(ref)
  }
}
