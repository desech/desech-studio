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
import HelperDOM from '../../../../helper/HelperDOM.js'
import HelperForm from '../../../../helper/HelperForm.js'
import ChangeStyleField from '../../../../component/ChangeStyleField.js'

export default {
  getEvents () {
    return {
      focusin: ['focusinSavePreviousValueEvent'],
      change: ['changeCreateVariablePromptEvent', 'changeGotoUpdateVariableEvent'],
      click: ['clickCreateVariableSubmitEvent'],
      keydown: ['keydownDeselectVariableEvent']
    }
  },

  focusinSavePreviousValueEvent (event) {
    if (this.isVariableSelect(event.target)) {
      event.target.dataset.previous = event.target.value
    }
  },

  changeCreateVariablePromptEvent (event) {
    if (this.isVariableSelect(event.target) && event.target.value === 'var-desech-input-create') {
      this.createVariablePrompt(event.target)
    }
  },

  changeGotoUpdateVariableEvent (event) {
    if (this.isVariableSelect(event.target) && event.target.value === 'var-desech-input-update') {
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

  isVariableSelect (node) {
    return node.tagName === 'SELECT' && (node.classList.contains('input-unit-measure') ||
      node.classList.contains('change-style'))
  },

  createVariablePrompt (select) {
    this.setSelectData(select)
    this.showCreateDialog(select.dataset.name || select.name)
  },

  setSelectData (select) {
    select.dataset.action = select.value
    select.value = select.dataset.previous
  },

  showCreateDialog (propertyName = null) {
    const dialog = this.getCreateDialog()
    const form = dialog.getElementsByTagName('form')[0]
    form.elements.name.focus()
    this.prepareCreateForm(form.elements, propertyName)
  },

  getCreateDialog () {
    return DialogComponent.showDialog({
      header: DialogComponent.getContentHtml('variable-create', 'header'),
      body: DialogComponent.getContentHtml('variable-create', 'body'),
      footer: DialogComponent.getContentHtml('variable-create', 'footer')
    })
  },

  prepareCreateForm (fields, propertyName) {
    fields.ref.value = HelperVariable.generateVariableRef()
    if (!propertyName) return
    fields.propertyName.value = propertyName
    fields.value.value = StateStyleSheet.getPropertyValue(propertyName)
    fields.type.value = RightVariableCommon.getPropertyType(propertyName)
    HelperDOM.hide(fields.type)
  },

  async createVariableSubmit (dialog) {
    const form = dialog.getElementsByTagName('form')[0]
    const success = this.validateVariable(form)
    if (success) await this.finishCreateVariable(dialog, form.elements)
  },

  validateVariable (form) {
    const fields = form.elements
    if (!form.checkValidity()) return false
    RightVariableCommon.validateName(fields.name)
    if (!form.checkValidity()) return false
    HelperForm.reportFieldError(fields.name, fields.type.value, 'requiredType')
    return form.checkValidity()
  },

  async finishCreateVariable (dialog, fields) {
    DialogComponent.closeDialog(dialog)
    const data = HelperForm.getFieldsData(fields)
    if (data.propertyName) {
      data.selector = StyleSheetSelector.getCurrentSelector()
    }
    await this.createVariableExec(data)
    HelperTrigger.triggerReload('right-panel')
  },

  async createVariableExec (variable) {
    const command = {
      do: {
        command: 'createVariable',
        variable
      },
      undo: {
        command: 'deleteVariable',
        variable
      }
    }
    StateCommand.stackCommand(command)
    await StateCommand.executeCommand(command.do)
  },

  gotoUpdateVariable (select) {
    this.setSelectData(select)
    const value = ChangeStyleField.getValue(select)
    const ref = HelperVariable.getVariableRef(value)
    StateSelectedVariable.selectVariable(ref)
  }
}
