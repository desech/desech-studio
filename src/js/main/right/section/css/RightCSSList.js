import HelperDOM from '../../../../helper/HelperDOM.js'
import RightCSSProperty from './RightCSSProperty.js'
import ChangeStyleField from '../../../../component/ChangeStyleField.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import RightCommon from '../../RightCommon.js'
import ColorPickerButton from '../../../../component/color-picker/ColorPickerButton.js'
import ExtendJS from '../../../../helper/ExtendJS.js'

export default {
  getEvents () {
    return {
      change: ['changeCreatePropertyEvent'],
      click: ['clickDeletePropertyEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  changeCreatePropertyEvent (event) {
    if (event.target.classList.contains('add-css-dropdown')) {
      this.createProperty(event.target)
    }
  },

  clickDeletePropertyEvent (event) {
    if (event.target.closest('.style-css-delete-button')) {
      this.deleteProperty(event.target.closest('li'))
    }
  },

  createProperty (createSelect) {
    const element = this.addPropertyToList(createSelect)
    createSelect.value = ''
    const field = element.getElementsByClassName('style-css-field')[0]
    RightCSSProperty.setPropertyStyle(field)
    RightCommon.toggleSidebarSection(createSelect.closest('.sidebar-section'))
  },

  addPropertyToList (createSelect, data = {}) {
    const element = this.prepareCreateElement(createSelect, data)
    const list = createSelect.closest('#css-section').getElementsByClassName('style-css-list')[0]
    list.appendChild(element)
    if (ExtendJS.isEmpty(data) && createSelect.value === 'custom') {
      element.getElementsByClassName('style-css-name')[0].focus()
    }
    return element
  },

  prepareCreateElement (createSelect, data) {
    const template = HelperDOM.getTemplate('template-style-css-element')
    const allData = this.getSelectPropertyData(createSelect, data)
    this.injectElementData(template, allData)
    return template
  },

  getSelectPropertyData (createSelect, data) {console.log(createSelect.value, data)
    const info = {}
    info.name = data.name || ((createSelect.value !== 'custom') ? createSelect.value : '')
    info.value = data.value || ''
    info.label = info.name ? info.name.replace('-webkit-', '') : ''
    info.template = createSelect.selectedOptions[0].dataset.template || createSelect.value
    console.log(info)
    return info
  },

  injectElementData (element, data) {
    const label = element.getElementsByClassName('style-css-elem-label')[0]
    this.injectElementProperty(label, data)
    const template = HelperDOM.getTemplate(`template-style-css-value-${data.template}`)
    element.getElementsByClassName('style-css-elem-value')[0].appendChild(template)
    this.setFieldNameValue(element.getElementsByClassName('style-css-field')[0], data)
  },

  injectElementProperty (node, data) {
    if (data.template === 'custom') {
      const template = HelperDOM.getTemplate('template-style-css-name-custom')
      node.appendChild(template)
    } else {
      node.textContent = data.label
    }
  },

  setFieldNameValue (field, data) {
    const li = field.closest('li')
    if (data.name) field.name = data.name
    switch (data.template) {
      case 'custom':
        this.setFieldNameValueCustom(li, field, data)
        break
      case 'color':
        li.dataset.property = data.name
        if (data.value) ColorPickerButton.injectPropertyColor(li)
        break
      default:
        if (data.value) ChangeStyleField.setValue(field, data.value)
        break
    }
  },

  setFieldNameValueCustom (li, field, data) {
    if (data.name) {
      const nameField = li.getElementsByClassName('style-css-name')[0]
      nameField.value = data.name
      nameField.setAttributeNS(null, 'disabled', '')
    }
    if (data.value) field.value = data.value
  },

  deleteProperty (element) {
    const field = element.getElementsByClassName('style-css-field')[0]
    RightCSSProperty.removePropertyStyle(field.name)
    const section = element.closest('.sidebar-section')
    element.remove()
    RightCommon.toggleSidebarSection(section)
  },

  injectList (createSelect, properties) {
    for (const property of Object.entries(properties)) {
      const data = {
        name: property[0],
        value: property[1]
      }
      this.prepareSelectForElementCreate(createSelect, data)
      this.addPropertyToList(createSelect, data)
    }
    createSelect.value = ''
  },

  prepareSelectForElementCreate (createSelect, data) {
    createSelect.value = data.name
    // if the option is not found, then it's a custom property
    if (!createSelect.selectedOptions[0]) createSelect.value = 'custom'
  }
}
