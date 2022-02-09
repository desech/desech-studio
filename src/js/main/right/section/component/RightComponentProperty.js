import HelperForm from '../../../../helper/HelperForm.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import StateCommand from '../../../../state/StateCommand.js'
import RightCommon from '../../RightCommon.js'
import HelperElement from '../../../../helper/HelperElement.js'
import HelperComponent from '../../../../helper/HelperComponent.js'

export default {
  getEvents () {
    return {
      click: ['clickAddPropertyEvent', 'clickDeletePropertyEvent'],
      change: ['changeEditPropertyEvent']
    }
  },

  clickAddPropertyEvent (event) {
    if (event.target.closest('.style-component-property-add')) {
      this.buttonAddProperty(event.target.closest('form'))
    }
  },

  async clickDeletePropertyEvent (event) {
    if (event.target.closest('.style-component-property-delete')) {
      await this.deleteProperty(event.target.closest('li'))
    }
  },

  async changeEditPropertyEvent (event) {
    if (event.target.classList.contains('style-component-property-field')) {
      await this.editProperty(event.target.closest('li'))
    }
  },

  buttonAddProperty (form) {
    const list = form.getElementsByClassName('style-component-list')[0]
    RightCommon.injectPropertyElement(list)
    const input = list.lastElementChild.getElementsByTagName('textarea')[0]
    input.focus()
  },

  async deleteProperty (li) {
    const form = li.closest('form')
    li.remove()
    await this.changePropertiesCommand(form)
  },

  async editProperty (li) {
    const name = li.getElementsByClassName('style-component-property-name')[0]
    const valid = this.validatePropertyName(name)
    if (name.value && valid) {
      await this.changePropertiesCommand(li.closest('form'))
    }
  },

  // class and className is not allowed
  // https://angular.io/guide/attribute-binding
  // [style.text-decoration], (click), [(size)], #itemForm, *ngIf, [ngClass]
  // https://v3.vuejs.org/api/directives.html#v-text
  // v-text, v-on:click, v-on:[event], @submit.prevent, :xlink:special
  validatePropertyName (field) {
    if (!field.value) return false
    const valid = !['class', 'className'].includes(field.value) &&
      /^([a-zA-Z0-9-_.:@#*[\]()])+$/g.test(field.value)
    this.validateForm(field, valid)
    return valid
  },

  validateForm (name, valid) {
    const output = valid ? '' : name.dataset.invalidError
    name.setCustomValidity(output)
    name.reportValidity()
  },

  async changePropertiesCommand (form, execute = true) {
    const ref = StateSelectedElement.getRef()
    if (!ref) return
    const properties = this.getFormProperties(form)
    const command = this.getCommandData(properties, ref, form.dataset.type)
    StateCommand.stackCommand(command)
    if (execute) await StateCommand.executeCommand(command.do)
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

  getCommandData (properties, ref, type) {
    const element = HelperElement.getElement(ref)
    const command = (type === 'component') ? 'changeComponentProperties' : 'changeProperties'
    // @todo fix this for inherited overrides
    const currentProperties = (type === 'component')
      ? HelperComponent.getInstanceProperties(element)
      : HelperElement.getProperties(element)
    return {
      do: { command, ref, properties },
      undo: { command, ref, properties: currentProperties }
    }
  }
}
