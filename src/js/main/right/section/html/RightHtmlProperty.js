import HelperEvent from '../../../../helper/HelperEvent.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import RightHtmlCommon from './RightHtmlCommon.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import HelperForm from '../../../../helper/HelperForm.js'

export default {
  getEvents () {
    return {
      click: ['clickAddPropertyEvent', 'clickDeletePropertyEvent'],
      change: ['changeEditPropertyEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickAddPropertyEvent (event) {
    if (event.target.closest('.style-html-prop-add')) {
      this.buttonAddProperty(event.target.closest('form'))
    }
  },

  clickDeletePropertyEvent (event) {
    if (event.target.closest('.style-html-prop-delete')) {
      this.deleteProperty(event.target.closest('li'))
    }
  },

  changeEditPropertyEvent (event) {
    if (event.target.classList.contains('style-html-prop-field')) {
      this.editProperty(event.target.closest('form'))
    }
  },

  injectProperties (template) {
    const container = template.getElementsByClassName('html-details-container')[0]
    const list = HelperDOM.getTemplate('template-style-html-property')
    container.appendChild(list)
    this.injectPropertyFields(container, list)
  },

  injectPropertyFields (container, form) {
    const list = form.getElementsByClassName('style-html-prop-list')[0]
    const fields = this.getExistingFields(container)
    const element = StateSelectedElement.getElement()
    this.addPropertyFields(list, fields, element)
  },

  getExistingFields (container) {
    const ignore = RightHtmlCommon.getAllIgnoredProperties()
    const fields = this.getDetailFields(container)
    return [...ignore, ...fields]
  },

  getDetailFields (container) {
    const form = container.getElementsByClassName('style-html-details')[0]
    const fields = form ? Object.keys(HelperForm.getFormValues(form)) : []
    return fields
  },

  addPropertyFields (list, fields, element) {
    for (const prop of element.propertys) {
      if (!fields.includes(prop.name)) this.addProperty(list, prop.name, prop.value)
    }
  },

  addProperty (list, name = null, value = null) {
    const template = HelperDOM.getTemplate('template-style-html-prop-element')
    const form = template.getElementsByClassName('style-html-element-form')[0]
    if (name) this.injectProperty(form.elements, name, value)
    list.appendChild(template)
  },

  injectProperty (fields, name, value) {
    fields.name.value = name
    fields.value.value = value
  },

  buttonAddProperty (form) {
    const list = form.getElementsByClassName('style-html-prop-list')[0]
    this.addProperty(list)
  },

  deleteProperty (li) {
    const form = li.getElementsByClassName('style-html-element-form')[0]
    this.deletePropertyCommand(form.elements.name.value)
    li.remove()
  },

  editProperty (form) {
    const name = form.elements.name.value
    const value = form.elements.value.value
    const valid = this.validateAttrName(form.elements.name)
    if (name && valid) this.savePropertyCommand(name, value)
  },

  validateAttrName (name) {
    if (!name.value) return false
    const valid = this.isNameValid(name.value)
    this.validateForm(name, valid)
    return valid
  },

  isNameValid (value) {
    // allow property names that contain components {{variables}}
    const valid = /^[a-z]([a-zA-Z0-9-])+$/g.test(value)
    const list = RightHtmlCommon.getAllIgnoredProperties()
    return valid && !list.includes(value)
  },

  validateForm (name, valid) {
    const output = valid ? '' : name.dataset.invalidError
    name.setCustomValidity(output)
    name.reportValidity()
  },

  savePropertyCommand (name, value) {
    RightHtmlCommon.changePropertyCommand(StateSelectedElement.getRef(), {
      // when the value is empty then we set a boolean value
      [name]: value || true
    })
  },

  deletePropertyCommand (name) {
    RightHtmlCommon.changePropertyCommand(StateSelectedElement.getRef(), {
      [name]: null
    })
  }
}
