import HelperEvent from '../../../../helper/HelperEvent.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import HelperForm from '../../../../helper/HelperForm.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import StateCommand from '../../../../state/StateCommand.js'

export default {
  getEvents () {
    return {
      click: ['clickAddPropertyEvent', 'clickDeletePropertyEvent'],
      input: ['inputResetPropertyEvent'],
      change: ['changeEditPropertyEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickAddPropertyEvent (event) {
    if (event.target.closest('.style-component-property-add')) {
      this.buttonAddProperty(event.target.closest('form'))
    }
  },

  clickDeletePropertyEvent (event) {
    if (event.target.closest('.style-component-property-delete')) {
      this.deleteProperty(event.target.closest('li'))
    }
  },

  inputResetPropertyEvent (event) {
    if (event.target.classList.contains('style-component-property-field')) {
      this.resetProperty(event.target.closest('li'))
    }
  },

  changeEditPropertyEvent (event) {
    if (event.target.classList.contains('style-component-property-field')) {
      this.editProperty(event.target.closest('li'))
    }
  },

  injectProperties (form) {
    const properties = StateSelectedElement.getComponentProperties()
    if (!properties) return
    const list = form.getElementsByClassName('style-component-list')[0]
    for (const [name, value] of Object.entries(properties)) {
      this.addProperty(list, name, value)
    }
  },

  addProperty (list, name = null, value = null) {
    const template = HelperDOM.getTemplate('template-style-component-property')
    const fields = template.getElementsByClassName('style-component-property-field')
    if (name) this.injectProperty(fields, name, value)
    list.appendChild(template)
  },

  injectProperty (fields, name, value) {
    fields[0].value = name
    fields[1].value = value
  },

  buttonAddProperty (form) {
    const list = form.getElementsByClassName('style-component-list')[0]
    this.addProperty(list)
  },

  deleteProperty (li) {
    const form = li.closest('.sidebar-section')
    li.remove()
    this.changePropertiesCommand(form)
  },

  resetProperty (li) {
    const name = li.getElementsByClassName('style-component-property-name')[0]
    name.setCustomValidity('')
    name.reportValidity()
  },

  editProperty (li) {
    const name = li.getElementsByClassName('style-component-property-name')[0]
    const valid = this.validatePropertyName(name)
    if (name.value && valid) this.changePropertiesCommand(li.closest('.sidebar-section'))
  },

  validatePropertyName (field) {
    if (!field.value) return false
    const valid = /^[a-z]([a-z0-9.])+$/gi.test(field.value)
    this.validateForm(field, valid)
    return valid
  },

  validateForm (name, valid) {
    const output = valid ? '' : name.dataset.invalidError
    name.setCustomValidity(output)
    name.reportValidity()
  },

  changePropertiesCommand (form, execute = true) {
    const properties = this.getFormProperties(form)
    const command = this.getCommandData(properties)
    StateCommand.stackCommand(command)
    if (execute) StateCommand.executeCommand(command.do)
  },

  getFormProperties (form) {
    const obj = {}
    const fields = HelperForm.getFormValues(form)
    if (!fields.name) return obj
    for (let i = 0; i < fields.name.length; i++) {
      obj[fields.name[i]] = fields.value[i]
    }
    return obj
  },

  getCommandData (properties) {
    const ref = StateSelectedElement.getRef()
    return {
      do: {
        command: 'changeComponentProperties',
        ref,
        properties
      },
      undo: {
        command: 'changeComponentProperties',
        ref,
        properties: StateSelectedElement.getComponentProperties()
      }
    }
  }
}
