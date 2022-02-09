import HelperEvent from '../../../../helper/HelperEvent.js'
import StateStyleSheet from '../../../../state/StateStyleSheet.js'
import DialogComponent from '../../../../component/DialogComponent.js'
import HelperForm from '../../../../helper/HelperForm.js'
import StateCommand from '../../../../state/StateCommand.js'
import HelperTrigger from '../../../../helper/HelperTrigger.js'
import RightVariableCommon from './RightVariableCommon.js'
import StyleSheetSelector from '../../../../state/stylesheet/StyleSheetSelector.js'
import HelperCanvas from '../../../../helper/HelperCanvas.js'
import HelperGlobal from '../../../../helper/HelperGlobal.js'
import ExtendJS from '../../../../helper/ExtendJS.js'
import HelperVariable from '../../../../helper/HelperVariable.js'

export default {
  getEvents () {
    return {
      focusin: ['focusinUnitSavePreviousValueEvent'],
      change: ['changeCreateVariablePromptEvent', 'changeGotoUpdateVariableEvent'],
      click: ['clickCreateVariableSubmitEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  focusinUnitSavePreviousValueEvent () {
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

  async clickCreateVariableSubmitEvent (event) {
    if (event.target.closest('.dialog-create-variable-confirm')) {
      await this.createVariableSubmit(event.target.closest('.dialog'))
    }
  },

  changeGotoUpdateVariableEvent (event) {
    if (event.target.classList.contains('input-unit-measure') &&
      event.target.value === 'var-desech-input-update') {
      this.gotoUpdateVariable(event.target)
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
    const data = this.getVariableData(form.elements)
    const propertyName = form.elements.property.value
    if (form.checkValidity()) this.validateVariable(form.elements.name, data)
    if (form.checkValidity()) await this.finishCreateVariable(dialog, data, propertyName)
    form.elements.name.reportValidity()
  },

  getVariableData (fields) {
    return {
      ref: HelperVariable.generateVariableRef(),
      name: RightVariableCommon.sanitizeVariable(fields.name.value),
      type: RightVariableCommon.getPropertyType(fields.property.value),
      value: StateStyleSheet.getPropertyValue(fields.property.value)
    }
  },

  validateVariable (field, data) {
    const duplicate = HelperGlobal.checkVarByName(data.name)
    HelperForm.reportFieldError(field, !duplicate, 'errorDuplicate')
    if (duplicate) return
    const numeric = ExtendJS.startsNumeric(data.name)
    HelperForm.reportFieldError(field, !numeric, 'errorInvalid')
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
      selector: StyleSheetSelector.getCurrentSelector(),
      responsive: HelperCanvas.getCurrentResponsiveWidth()
    }
  },

  gotoUpdateVariable (select) {
    this.setSelectData(select)
    console.log('update')
  }
}
