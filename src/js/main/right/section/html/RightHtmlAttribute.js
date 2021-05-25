import HelperEvent from '../../../../helper/HelperEvent.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import RightHtmlCommon from './RightHtmlCommon.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import HelperForm from '../../../../helper/HelperForm.js'

export default {
  getEvents () {
    return {
      click: ['clickAddAttributeEvent', 'clickDeleteAttributeEvent'],
      change: ['changeEditAttributeEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickAddAttributeEvent (event) {
    if (event.target.closest('.style-html-attr-add')) {
      this.buttonAddAttribute(event.target.closest('form'))
    }
  },

  clickDeleteAttributeEvent (event) {
    if (event.target.closest('.style-html-attr-delete')) {
      this.deleteAttribute(event.target.closest('li'))
    }
  },

  changeEditAttributeEvent (event) {
    if (event.target.classList.contains('style-html-attr-field')) {
      this.editAttribute(event.target.closest('form'))
    }
  },

  injectAttributes (template) {
    const container = template.getElementsByClassName('slider-extra-container')[0]
    const list = HelperDOM.getTemplate('template-style-html-attribute')
    container.appendChild(list)
    this.injectAttributeFields(container, list)
  },

  injectAttributeFields (container, form) {
    const list = form.getElementsByClassName('style-html-attr-list')[0]
    const element = StateSelectedElement.getElement()
    const fields = this.getExistingFields(container, element)
    this.addAttributeFields(list, fields, element)
  },

  getExistingFields (container, element) {
    const ignore = RightHtmlCommon.getIgnoredAttributes(element)
    const fields = this.getDetailFields(container)
    return [...ignore, ...fields]
  },

  getDetailFields (container) {
    const form = container.getElementsByClassName('style-html-details')[0]
    const fields = form ? Object.keys(HelperForm.getFormValues(form)) : []
    return fields
  },

  addAttributeFields (list, fields, element) {
    for (const attr of element.attributes) {
      if (!fields.includes(attr.name)) {
        this.addAttribute(list, attr.name, attr.value)
      }
    }
  },

  addAttribute (list, name = null, value = null) {
    const template = HelperDOM.getTemplate('template-style-html-attr-element')
    const form = template.getElementsByClassName('style-html-element-form')[0]
    if (name) this.injectAttribute(form.elements, name, value)
    list.appendChild(template)
  },

  injectAttribute (fields, name, value) {
    fields.name.value = name
    fields.name.setAttributeNS(null, 'disabled', '')
    fields.value.value = value
  },

  buttonAddAttribute (form) {
    const list = form.getElementsByClassName('style-html-attr-list')[0]
    this.addAttribute(list)
    const input = list.lastElementChild.getElementsByTagName('input')[0]
    input.focus()
  },

  deleteAttribute (li) {
    const form = li.getElementsByClassName('style-html-element-form')[0]
    this.deleteAttributeCommand(form.elements.name.value)
    li.remove()
  },

  editAttribute (form) {
    const name = form.elements.name.value
    const value = form.elements.value.value
    const valid = this.validateAttrName(form.elements.name)
    if (name && valid) {
      this.saveAttributeCommand(name, value)
      form.elements.name.setAttributeNS(null, 'disabled', '')
    }
  },

  validateAttrName (name) {
    if (!name.value) return false
    const valid = this.isNameValid(name.value)
    this.validateForm(name, valid)
    return valid
  },

  isNameValid (value) {
    // allow attribute names that contain components {{variables}}
    const valid = /^[a-z]([a-zA-Z0-9-])+$/g.test(value)
    const element = StateSelectedElement.getElement()
    const list = RightHtmlCommon.getIgnoredAttributes(element)
    return valid && !list.includes(value)
  },

  validateForm (name, valid) {
    const output = valid ? '' : name.dataset.invalidError
    name.setCustomValidity(output)
    name.reportValidity()
  },

  saveAttributeCommand (name, value) {
    RightHtmlCommon.changeAttributeCommand(StateSelectedElement.getRef(), {
      // when the value is empty then we set a boolean value
      [name]: value || true
    })
  },

  deleteAttributeCommand (name) {
    RightHtmlCommon.changeAttributeCommand(StateSelectedElement.getRef(), {
      [name]: null
    })
  }
}
