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
    this.showCreateDialog(select.dataset.name)
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
    const fields = form.elements
    if (form.checkValidity()) RightVariableCommon.validateName(fields.name)
    if (form.checkValidity()) await this.finishCreateVariable(dialog, fields)
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
    const ref = HelperVariable.getVariableRef(select.previousElementSibling.value)
    StateSelectedVariable.selectVariable(ref)
  }
}
