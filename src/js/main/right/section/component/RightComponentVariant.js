import HelperDOM from '../../../../helper/HelperDOM.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import HelperForm from '../../../../helper/HelperForm.js'
import HelperComponent from '../../../../helper/HelperComponent.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import StateCommand from '../../../../state/StateCommand.js'
import DialogComponent from '../../../../component/DialogComponent.js'

export default {
  getEvents () {
    return {
      click: ['clickShowSaveEvent', 'clickConfirmSaveEvent', 'clickPromptDeleteEvent',
        'clickConfirmDeleteEvent', 'clickShowRenameEvent', 'clickCancelRenameEvent',
        'clickConfirmRenameEvent'],
      input: ['inputResetInvalidFieldsEvent'],
      change: ['changeSwitchVariantEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickShowSaveEvent (event) {
    if (event.target.classList.contains('style-variant-save-button')) {
      this.showSave(event.target.closest('.style-variant-section'))
    }
  },

  async clickConfirmSaveEvent (event) {
    if (event.target.closest('.style-variant-confirm-button')) {
      await this.confirmSave(event.target.closest('form'))
    }
  },

  inputResetInvalidFieldsEvent (event) {
    if (event.target.classList.contains('style-variant-field')) {
      HelperForm.resetValidity(event.target.closest('form'))
    }
  },

  async changeSwitchVariantEvent (event) {
    if (event.target.classList.contains('style-variant-element-value')) {
      const fields = event.target.closest('form').elements
      await this.switchVariant(fields.name.value, fields.value.value)
    }
  },

  clickPromptDeleteEvent (event) {
    if (event.target.closest('.style-variant-element-delete')) {
      this.promptDelete(event.target.closest('li'))
    }
  },

  async clickConfirmDeleteEvent (event) {
    if (event.target.closest('.dialog-delete-variant-confirm')) {
      await this.confirmDelete(event.target.closest('button'))
    }
  },

  clickShowRenameEvent (event) {
    if (event.target.closest('.style-variant-element-rename')) {
      this.showRename(event.target.closest('li'))
    }
  },

  clickCancelRenameEvent (event) {
    if (event.target.closest('.style-variant-rename-cancel-button')) {
      this.cancelRename(event.target.closest('li'))
    }
  },

  async clickConfirmRenameEvent (event) {
    if (event.target.closest('.style-variant-rename-confirm-button')) {
      await this.confirmRename(event.target.closest('li'))
    }
  },

  showSave (container) {
    const form = container.getElementsByClassName('style-variant-form')[0]
    HelperDOM.toggle(form)
    form.elements.name.focus()
  },

  async confirmSave (form) {
    const element = StateSelectedElement.getElement()
    if (form.checkValidity()) this.validateNames(form)
    if (form.checkValidity()) this.validateExists(element, form.elements)
    if (form.checkValidity()) {
      HelperDOM.hide(form)
      await this.successSave(element, form.elements.name.value, form.elements.value.value)
    }
  },

  validateNames (form) {
    for (const field of form.elements) {
      if (!field.value) continue
      const valid = /^([a-z0-9-])+$/g.test(field.value)
      this.reportFieldError(field, valid, 'invalidError')
    }
  },

  validateExists (element, fields, existingData = null) {
    const name = fields.name.value
    const value = fields.value.value
    const data = HelperComponent.getComponentData(element)
    const variants = data?.main?.variants || {}
    if (existingData) {
      const validName = !variants[name] || name === existingData.name
      this.reportFieldError(fields.name, validName, 'existsError')
    }
    const validValue = !variants[name] || !variants[name][value] ||
      (existingData && value === existingData.value)
    this.reportFieldError(fields.value, validValue, 'existsError')
  },

  reportFieldError (field, valid, errorMsg) {
    const output = valid ? '' : field.dataset[errorMsg]
    field.setCustomValidity(output)
    field.reportValidity()
  },

  async successSave (element, name, value, execute = true) {
    const component = HelperComponent.getComponentData(element)
    const cmd = {
      do: {
        command: 'saveVariant',
        ref: component.ref,
        name,
        value,
        overrides: component.overrides
      },
      undo: {
        command: 'deleteVariant',
        ref: component.ref,
        name,
        value,
        undo: true
      }
    }
    StateCommand.stackCommand(cmd)
    await StateCommand.executeCommand(cmd.do)
  },

  async switchVariant (name, value, execute = true) {
    const element = StateSelectedElement.getElement()
    const data = HelperComponent.getComponentData(element)
    const cmd = {
      do: {
        command: 'switchVariant',
        ref: data.ref,
        name,
        value
      },
      undo: {
        command: 'switchVariant',
        ref: data.ref,
        name,
        value: data?.variants ? data?.variants[name] : null
      }
    }
    StateCommand.stackCommand(cmd)
    await StateCommand.executeCommand(cmd.do)
  },

  promptDelete (li) {
    const dialog = DialogComponent.showDialog({
      header: DialogComponent.getContentHtml('delete-variant', 'header'),
      footer: DialogComponent.getContentHtml('delete-variant', 'footer')
    })
    const button = dialog.getElementsByClassName('dialog-delete-variant-confirm')[0]
    button.dataset.value = li.dataset.value
  },

  async confirmDelete (button) {
    const data = JSON.parse(button.dataset.value)
    const element = StateSelectedElement.getElement()
    const component = HelperComponent.getComponentData(element)
    await this.executeDelete(component, data.name, data.value)
  },

  async executeDelete (component, name, value, execute = true) {
    const cmd = {
      do: {
        command: 'deleteVariant',
        ref: component.ref,
        name,
        value
      },
      undo: {
        command: 'saveVariant',
        ref: component.ref,
        name,
        value,
        overrides: component.main.variants[name][value],
        undo: true
      }
    }
    StateCommand.stackCommand(cmd)
    await StateCommand.executeCommand(cmd.do)
  },

  showRename (li) {
    const template = HelperDOM.getTemplate('template-style-component-variant-form')
    li.children[1].innerHTML = template.innerHTML
    this.addFormRenameData(li)
    HelperDOM.hide(li.children[0])
    HelperDOM.show(li.children[1])
  },

  addFormRenameData (li) {
    const data = JSON.parse(li.dataset.value)
    const fields = li.children[1].elements
    fields.name.value = data.name
    fields.value.value = data.value
  },

  cancelRename (li) {
    HelperDOM.hide(li.children[1])
    HelperDOM.show(li.children[0])
  },

  async confirmRename (li) {
    const form = li.children[1]
    const element = StateSelectedElement.getElement()
    const data = JSON.parse(li.dataset.value)
    if (form.checkValidity()) this.validateNames(form)
    if (form.checkValidity()) this.validateExists(element, form.elements, data)
    if (form.checkValidity()) {
      if (form.elements.name.value === data.name && form.elements.value.value === data.value) {
        this.cancelRename(li)
      } else {
        await this.saveRename(element, form.elements, data)
      }
    }
  },

  async saveRename (element, fields, oldData) {
    const ref = HelperComponent.getInstanceRef(element)
    const cmd = {
      do: {
        command: 'renameVariant',
        ref,
        data: {
          name: fields.name.value,
          value: fields.value.value,
          oldName: oldData.name,
          oldValue: oldData.value
        }
      },
      undo: {
        command: 'renameVariant',
        ref,
        data: {
          name: oldData.name,
          value: oldData.value,
          oldName: fields.name.value,
          oldValue: fields.value.value
        }
      }
    }
    StateCommand.stackCommand(cmd)
    await StateCommand.executeCommand(cmd.do)
  }
}
