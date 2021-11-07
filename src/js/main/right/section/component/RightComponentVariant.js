import ExtendJS from '../../../../helper/ExtendJS.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import HelperForm from '../../../../helper/HelperForm.js'
import HelperComponent from '../../../../helper/HelperComponent.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import StateCommand from '../../../../state/StateCommand.js'

export default {
  getEvents () {
    return {
      click: ['clickShowSaveVariantEvent', 'clickConfirmSaveVariantEvent'],
      input: ['inputResetInvalidFieldsEvent'],
      change: ['changeSwitchVariantEvent']
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

  async changeSwitchVariantEvent () {
    if (event.target.classList.contains('style-variant-element-value')) {
      await this.switchVariant(event.target.name, event.target.value)
    }
  },

  // this is a component
  injectVariants (template, element, data) {
    if (HelperComponent.isComponentElement(element)) return
    const container = template.getElementsByClassName('style-variant-section')[0]
    HelperDOM.show(container)
    this.injectVariantsList(container, data)
    this.injectVariantsForm(container, data)
  },

  injectVariantsList (container, data) {
    if (ExtendJS.isEmpty(data.main?.variants)) return
    const list = container.getElementsByClassName('style-variant-elements')[0]
    for (const [name, values] of Object.entries(data.main.variants)) {
      this.injectVariantElement(list, name, Object.keys(values), data?.variants)
    }
  },

  injectVariantElement (list, name, values, variants) {
    const template = HelperDOM.getTemplate('template-style-component-variant')
    template.getElementsByClassName('style-variant-element-name')[0].textContent = name
    const select = template.getElementsByClassName('style-variant-element-value')[0]
    select.name = name
    this.injectVariantOptions(select, values, variants ? variants[name] : null)
    list.appendChild(template)
  },

  injectVariantOptions (select, values, selected) {
    for (const value of values) {
      const option = document.createElement('option')
      select.appendChild(option)
      this.setVariantOption(option, value, selected)
    }
  },

  setVariantOption (option, value, selected) {
    option.value = option.textContent = value
    if (!selected) return
    if (value === selected) option.setAttributeNS(null, 'selected', '')
    const buttons = option.closest('li').getElementsByTagName('button')
    HelperDOM.show(buttons)
  },

  injectVariantsForm (container, data) {
    if (ExtendJS.isEmpty(data?.overrides)) return
    const node = container.getElementsByClassName('style-variant-form-container')[0]
    HelperDOM.show(node)
    this.injectVariantsDatalist(container, data)
  },

  injectVariantsDatalist (container, data) {
    if (ExtendJS.isEmpty(data.main?.variants)) return
    const datalist = container.getElementsByClassName('style-variant-list-names')[0]
    for (const name of Object.keys(data.main.variants)) {
      const option = document.createElement('option')
      option.value = option.textContent = name
      datalist.appendChild(option)
    }
  },

  showSaveVariant (container) {
    const form = container.getElementsByClassName('style-variant-form')[0]
    HelperDOM.toggle(form)
    form.elements.name.focus()
  },

  async confirmSaveVariant (form) {
    const element = StateSelectedElement.getElement()
    if (form.checkValidity()) this.validateNames(form)
    if (form.checkValidity()) this.validateExists(element, form.elements)
    if (form.checkValidity()) {
      HelperDOM.hide(form)
      await this.successSaveVariant(element, form.elements.name.value, form.elements.value.value)
    }
  },

  validateNames (form) {
    for (const field of form.elements) {
      if (!field.value) continue
      const valid = /^([a-z0-9-])+$/g.test(field.value)
      this.reportFieldError(field, valid, 'invalidError')
    }
  },

  validateExists (element, fields) {
    const name = fields.name.value
    const value = fields.value.value
    const data = HelperComponent.getComponentData(element)
    const valid = !data?.main?.variants[name] || !data?.main?.variants[name][value]
    this.reportFieldError(fields.value, valid, 'existsError')
  },

  reportFieldError (field, valid, errorMsg) {
    const output = valid ? '' : field.dataset[errorMsg]
    field.setCustomValidity(output)
    field.reportValidity()
  },

  async successSaveVariant (element, name, value, execute = true) {
    const ref = HelperComponent.getInstanceRef(element)
    const cmd = {
      do: {
        command: 'saveVariant',
        ref,
        name,
        value
      },
      undo: {
        command: 'deleteVariant',
        ref,
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
  }
}
