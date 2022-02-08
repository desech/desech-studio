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

export default {
  getEvents () {
    return {
      click: ['clickCreateVariablePromptEvent', 'clickCreateVariableSubmitEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickCreateVariablePromptEvent (event) {
    if (event.target.classList.contains('variable-field') &&
      event.target.value === 'desech-variable-input-create') {
      this.createVariablePrompt(event.target)
    }
  },

  async clickCreateVariableSubmitEvent (event) {
    if (event.target.closest('.dialog-create-variable-confirm')) {
      await this.createVariableSubmit(event.target.closest('.dialog'))
    }
  },

  createVariablePrompt (field) {
    const dialog = this.showCreateOverlay()
    const fields = dialog.getElementsByTagName('form')[0].elements
    fields.name.focus()
    fields.property.value = field.dataset.name
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
    if (form.checkValidity()) this.validateVariable(form.elements, data)
    if (form.checkValidity()) await this.finishCreateVariable(dialog, data)
    form.elements.name.reportValidity()
  },

  getVariableData (fields) {
    return {
      variableName: RightVariableCommon.sanitizeVariable(fields.name.value),
      propertyName: fields.property.value,
      propertyValue: StateStyleSheet.getPropertyValue(fields.property.value)
    }
  },

  validateVariable (fields, data) {
    const valid = !(data.variableName in HelperGlobal.getVariables())
    HelperForm.reportFieldError(fields.name, valid, 'errorDuplicate')
  },

  async finishCreateVariable (dialog, data) {
    DialogComponent.closeDialog(dialog)
    await this.createVariableExec(data)
    HelperTrigger.triggerReload('right-panel')
  },

  async createVariableExec (variable) {
    const style = this.getStyleData()
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

  getStyleData () {
    return {
      selector: StyleSheetSelector.getCurrentSelector(),
      responsive: HelperCanvas.getCurrentResponsiveWidth()
    }
  }
}
