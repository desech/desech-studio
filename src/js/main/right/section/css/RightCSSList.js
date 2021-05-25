import HelperDOM from '../../../../helper/HelperDOM.js'
import RightCSSProperty from './RightCSSProperty.js'
import ChangeStyleField from '../../../../component/ChangeStyleField.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import RightCommon from '../../RightCommon.js'

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

  createProperty (select) {
    const element = this.addPropertyToList(select)
    select.value = ''
    RightCSSProperty.setProperty(element.getElementsByClassName('change-style')[0])
    RightCommon.enableToggle(select.closest('.sidebar-section'))
  },

  addPropertyToList (select, property = {}) {
    const element = this.prepareCreateElement(select, property)
    const list = select.closest('#css-section').getElementsByClassName('style-css-list')[0]
    list.appendChild(element)
    return element
  },

  prepareCreateElement (select, property = {}) {
    const template = HelperDOM.getTemplate('template-style-css-element')
    const data = this.getSelectPropertyData(select, property)
    this.injectElementData(template, data)
    return template
  },

  getSelectPropertyData (select, property = {}) {
    return {
      name: select.value,
      label: select.value.replace('-webkit-', ''),
      valueTemplate: select.selectedOptions[0].dataset.template || select.value,
      property: property
    }
  },

  injectElementData (element, data) {
    const property = element.getElementsByClassName('style-css-elem-property')[0]
    this.injectElementProperty(property, data.label)
    const template = HelperDOM.getTemplate(`template-style-css-value-${data.valueTemplate}`)
    element.getElementsByClassName('style-css-elem-value')[0].appendChild(template)
    this.setElementValue(element.getElementsByClassName('change-style')[0], data)
  },

  injectElementProperty (container, label) {
    if (label === 'custom') {
      container.appendChild(HelperDOM.getTemplate('template-style-css-name-custom'))
    } else {
      container.textContent = label
    }
  },

  setElementValue (field, data) {
    if (data.name !== 'custom') field.name = data.name
    if (data.property.value) {
      this.setPropertyElementValue(field, data)
      if (data.name === 'custom') {
        field.closest('li').getElementsByClassName('css-property')[0].value = data.property.name
      }
    }
  },

  setPropertyElementValue (field, data) {
    switch (data.valueTemplate) {
      case 'custom':
        field.value = data.property.value
        field.name = data.property.name
        break
      case 'color':
        field.value = data.property.value
        this.setColor(field.closest('li'), data.property.value)
        break
      default:
        ChangeStyleField.setValue(field, data.property.value)
        break
    }
  },

  setColor (li, color) {
    const buttons = li.getElementsByClassName('color-button-main')
    HelperDOM.toggleClass(buttons[0], 'selected', color === 'inherit')
    HelperDOM.toggleClass(buttons[1], 'selected', color !== 'inherit')
    li.getElementsByClassName('color-button')[0].style.backgroundColor = color
  },

  deleteProperty (element) {
    const container = element.closest('.sidebar-section')
    RightCSSProperty.removeProperty(element.getElementsByClassName('change-style')[0].name)
    element.remove()
    RightCommon.enableToggle(container)
  },

  injectList (select, properties) {
    for (const property of Object.entries(properties)) {
      const data = {
        name: property[0],
        value: property[1]
      }
      this.prepareSelectForProperty(select, data)
      this.addPropertyToList(select, data)
    }
    // make sure our select is reset
    select.value = ''
  },

  prepareSelectForProperty (select, data) {
    select.value = data.name
    // if the option is not found, then it's a custom property
    if (!select.selectedOptions[0]) select.value = 'custom'
  }
}
