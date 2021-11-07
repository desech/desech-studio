import ExtendJS from '../../../../helper/ExtendJS.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import HelperForm from '../../../../helper/HelperForm.js'
import HelperComponent from '../../../../helper/HelperComponent.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import StateCommand from '../../../../state/StateCommand.js'
import HelperElement from '../../../../helper/HelperElement.js'

export default {
  getEvents () {
    return {
      click: ['clickShowSaveVariantEvent', 'clickConfirmSaveVariantEvent'],
      input: ['inputResetInvalidFieldsEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickShowSaveVariantEvent (event) {
    if (event.target.classList.contains('style-variant-save-button')) {
      this.showSaveVariant(event.target.closest('.style-variant-section'))
    }
  },

  async clickConfirmSaveVariantEvent (event) {
    if (event.target.closest('.style-variant-confirm-button')) {
      await this.confirmSaveVariant(event.target.closest('form'))
    }
  },

  inputResetInvalidFieldsEvent () {
    if (event.target.classList.contains('style-variant-field')) {
      HelperForm.resetValidity(event.target.closest('form'))
    }
  },

  injectVariants (template, element, overrides) {
    if (ExtendJS.isEmpty(overrides) || !HelperComponent.isMovableElement(element)) return
    const container = template.getElementsByClassName('style-variant-section')[0]
    HelperDOM.show(container)
  },

  showSaveVariant (container) {
    const form = container.getElementsByClassName('style-variant-form')[0]
    HelperDOM.toggle(form)
    form.elements.name.focus()
  },

  async confirmSaveVariant (form) {
    if (form.checkValidity()) this.validateNames(form)
    if (form.checkValidity()) this.validateExists(form)
    if (form.checkValidity()) {
      HelperDOM.hide(form)
      await this.successSaveVariant(form.elements.name.value, form.elements.value.value)
    }
  },

  validateNames (form) {
    for (const field of form.elements) {
      if (!field.value) continue
      const valid = /^([a-z0-9-])+$/g.test(field.value)
      const output = valid ? '' : field.dataset.invalidError
      field.setCustomValidity(output)
      field.reportValidity()
    }
  },

  validateExists (form) {
    // @todo
    console.log('check exists')
  },

  async successSaveVariant (name, value, execute = true) {
    const element = StateSelectedElement.getElement()
    const ref = HelperElement.getRef(element)
    const cmd = {
      do: { command: 'saveVariant', ref, name, value },
      undo: { command: 'deleteVariant', ref, name, value, undo: true }
    }
    StateCommand.stackCommand(cmd)
    await StateCommand.executeCommand(cmd.do)
  }
}
