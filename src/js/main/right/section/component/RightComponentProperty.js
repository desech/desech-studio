import HelperEvent from '../../../../helper/HelperEvent.js'
import HelperForm from '../../../../helper/HelperForm.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import StateCommand from '../../../../state/StateCommand.js'
import RightCommon from '../../RightCommon.js'

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

  buttonAddProperty (form) {
    const list = form.getElementsByClassName('style-component-list')[0]
    RightCommon.injectPropertyElement(list)
  },

  deleteProperty (li) {
    const form = li.closest('form')
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
    if (name.value && valid) this.changePropertiesCommand(li.closest('form'))
  },

  validatePropertyName (field) {
    if (!field.value) return false
    const valid = /^([^ "'=])+$/g.test(field.value)
    this.validateForm(field, valid)
    return valid
  },

  validateForm (name, valid) {
    const output = valid ? '' : name.dataset.invalidError
    name.setCustomValidity(output)
    name.reportValidity()
  },

  changePropertiesCommand (form, execute = true) {
    const ref = StateSelectedElement.getRef()
    if (!ref) return
    const properties = this.getFormProperties(form)
    const command = this.getCommandData(properties, ref)
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

  getCommandData (properties, ref) {
    return {
      do: {
        command: 'changeProperties',
        ref,
        properties
      },
      undo: {
        command: 'changeProperties',
        ref,
        properties: StateSelectedElement.getElementProperties()
      }
    }
  }
}
