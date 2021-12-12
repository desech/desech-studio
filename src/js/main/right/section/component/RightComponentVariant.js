import HelperDOM from '../../../../helper/HelperDOM.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import HelperForm from '../../../../helper/HelperForm.js'
import HelperComponent from '../../../../helper/HelperComponent.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import StateCommand from '../../../../state/StateCommand.js'
import DialogComponent from '../../../../component/DialogComponent.js'
import HelperOverride from '../../../../helper/HelperOverride.js'
import ExtendJS from '../../../../helper/ExtendJS.js'
import StyleSheetComponent from '../../../../state/stylesheet/StyleSheetComponent.js'

export default {
  getEvents () {
    return {
      click: ['clickShowCreateEvent', 'clickConfirmCreateEvent', 'clickUpdateVariantEvent',
        'clickPromptDeleteEvent', 'clickConfirmDeleteEvent', 'clickShowRenameEvent',
        'clickCancelRenameEvent', 'clickConfirmRenameEvent'],
      input: ['inputResetInvalidFieldsEvent'],
      change: ['changeSwitchVariantEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickShowCreateEvent (event) {
    if (event.target.classList.contains('style-variant-create-button')) {
      this.showCreate(event.target.closest('.style-variant-section'))
    }
  },

  async clickConfirmCreateEvent (event) {
    if (event.target.closest('.style-variant-confirm-button')) {
      await this.confirmCreate(event.target.closest('form'))
    }
  },

  async clickUpdateVariantEvent (event) {
    if (event.target.classList.contains('style-variant-update-button')) {
      await this.updateVariant()
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
      await this.executeSwitch(fields.name.value, fields.value.value)
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

  showCreate (container) {
    this.validateCreate()
    const form = container.getElementsByClassName('style-variant-form')[0]
    HelperDOM.toggle(form)
    form.elements.name.focus()
  },

  validateCreate () {
    const element = StateSelectedElement.getElement()
    const data = HelperComponent.getComponentData(element)
    if (data.variants) throw new Error('Please make sure no variants are selected')
  },

  async confirmCreate (form) {
    const element = StateSelectedElement.getElement()
    const data = HelperComponent.getComponentData(element)
    if (form.checkValidity()) this.fixNames(form)
    if (form.checkValidity()) this.validateExists(data, form.elements)
    if (form.checkValidity()) {
      HelperDOM.hide(form)
      await this.executeCreate(element, form.elements.name.value, form.elements.value.value)
    }
  },

  fixNames (form) {
    for (const field of form.elements) {
      field.value = HelperComponent.sanitizeComponent(field.value)
    }
  },

  validateExists (data, fields, existingData = null) {
    const name = fields.name.value
    const value = fields.value.value
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

  async executeCreate (element, name, value, execute = true) {
    const data = HelperComponent.getComponentData(element)
    const cmd = {
      do: {
        command: 'createVariant',
        ref: data.ref,
        name,
        value,
        newVariant: true
      },
      undo: {
        command: 'deleteVariant',
        ref: data.ref,
        name,
        value,
        newVariant: true
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
    const buttonData = JSON.parse(button.dataset.value)
    const element = StateSelectedElement.getElement()
    const data = HelperComponent.getComponentData(element)
    await this.executeDelete(data, buttonData.name, buttonData.value)
  },

  async executeDelete (data, name, value, execute = true) {
    const style = StyleSheetComponent.getVariantOverrides(data.file, name, value)
    const cmd = {
      do: {
        command: 'deleteVariant',
        ref: data.ref,
        name,
        value,
        style
      },
      undo: {
        command: 'createVariant',
        ref: data.ref,
        name,
        value,
        style
      }
    }
    StateCommand.stackCommand(cmd)
    await StateCommand.executeCommand(cmd.do)
  },

  async updateVariant () {
    const element = StateSelectedElement.getElement()
    const data = HelperComponent.getComponentData(element)
    if (!data.variants) {
      throw new Error('Please make sure a variant is selected')
    } else if (Object.keys(data.variants).length > 1) {
      throw new Error('Please make sure only one variant is selected')
    }
    await this.executeUpdate(element, data)
  },

  async executeUpdate (element, data, execute = true) {
    const name = Object.keys(data.variants)[0]
    const value = data.variants[name]
    const style = StyleSheetComponent.getAllOverrides(data, name, value)
    const cmd = {
      do: {
        command: 'updateVariant',
        ref: data.ref,
        name,
        value,
        overrides: null,
        variantOverrides: this.getMergedOverrides(data, name, value),
        styleAction: 'convert'
      },
      undo: {
        command: 'updateVariant',
        ref: data.ref,
        name,
        value,
        overrides: data.overrides,
        variantOverrides: data.main.variants[name][value],
        styleAction: 'revert',
        style
      }
    }
    StateCommand.stackCommand(cmd)
    await StateCommand.executeCommand(cmd.do)
  },

  getMergedOverrides (data, name, value) {
    const current = ExtendJS.cloneData(data.main.variants[name][value])
    HelperOverride.mergeObjects(current, data.overrides)
    return current
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
    if (form.checkValidity()) this.fixNames(form)
    if (form.checkValidity()) this.validateExists(element, form.elements, data)
    if (form.checkValidity()) {
      if (form.elements.name.value === data.name && form.elements.value.value === data.value) {
        this.cancelRename(li)
      } else {
        await this.executeRename(element, form.elements, data)
      }
    }
  },

  async executeRename (element, fields, oldData) {
    const data = HelperComponent.getComponentData(element)
    const cmd = {
      do: {
        command: 'renameVariant',
        ref: data.ref,
        values: {
          name: fields.name.value,
          value: fields.value.value,
          oldName: oldData.name,
          oldValue: oldData.value
        }
      },
      undo: {
        command: 'renameVariant',
        ref: data.ref,
        values: {
          name: oldData.name,
          value: oldData.value,
          oldName: fields.name.value,
          oldValue: fields.value.value
        }
      }
    }
    StateCommand.stackCommand(cmd)
    await StateCommand.executeCommand(cmd.do)
  },

  async executeSwitch (name, value, execute = true) {
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
  }
}
