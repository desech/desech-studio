import RightEffectTypeFilter from './type/RightEffectTypeFilter.js'
import RightEffectTypeShadow from './type/RightEffectTypeShadow.js'
import RightEffectTypeTransform from './type/RightEffectTypeTransform.js'
import RightEffectTypeTransition from './type/RightEffectTypeTransition.js'
import RightEffectTypeBlend from './type/RightEffectTypeBlend.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import ExtendJS from '../../../../helper/ExtendJS.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import RightEffectCommon from './type/RightEffectCommon.js'
import ColorPickerCommon from '../../../../component/color-picker/ColorPickerCommon.js'
import RightCommon from '../../RightCommon.js'

export default {
  getModule (type) {
    const modules = {
      filter: RightEffectTypeFilter,
      'box-shadow': RightEffectTypeShadow,
      transform: RightEffectTypeTransform,
      transition: RightEffectTypeTransition,
      'mix-blend-mode': RightEffectTypeBlend
    }
    return modules[type]
  },

  getEvents () {
    return {
      click: ['clickEffectFieldsEvent'],
      change: ['changeEffectFieldsEvent'],
      colorchange: ['colorchangeShadowEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickEffectFieldsEvent (event) {
    if (event.target.closest('.effect-form-container .effect-button')) {
      this.changeEffectFields(event.target.closest('#effect-section'))
    }
  },

  changeEffectFieldsEvent (event) {
    if (event.target.closest('.effect-form-container .effect-field') ||
      event.target.closest('.effect-form-container .timing-field')) {
      this.changeEffectFields(event.target.closest('#effect-section'))
    }
  },

  colorchangeShadowEvent (event) {
    if (event.target.closest('.effect-form-container .color-picker')) {
      this.changeShadowColor(event.target, event.detail)
    }
  },

  getTemplate (type, subtype) {
    return this.getModule(type).getTemplate(subtype)
  },

  getValueAtIndex (type, index) {
    return this.getModule(type).getParsedValues()[index] || {}
  },

  injectData (type, template, value, subtype) {
    this.getModule(type).injectData(template, value, subtype)
  },

  setEffect (section, type, subtype) {
    const current = RightEffectCommon.getActiveElement(section)
    const value = this.getModule(type).getDisplayedValue(section, subtype)
    const data = this.getModule(type).parseCSS(value)[0]
    this.setElementData(current, type, subtype, data)
    RightCommon.changeStyle(this.getProperty(type, current, value))
  },

  getDelimiter (type) {
    return (type === 'shadow' || type === 'transition') ? ', ' : ' '
  },

  setEffectAtIndex (value, type, index) {
    const values = this.getValuesArray(type)
    values[index] = value
    return values.join(this.getDelimiter(type))
  },

  getValuesArray (type) {
    const values = this.getModule(type).getParsedValues()
    const results = []
    for (const val of values) {
      results.push(val.value)
    }
    return results
  },

  changeEffectFields (section) {
    const [type, subtype] = this.getSectionTypes(section)
    this.setEffect(section, type, subtype)
  },

  getSectionTypes (section) {
    const select = section.getElementsByClassName('effect-type')[0]
    return [
      select.selectedOptions[0].dataset.type,
      select.value
    ]
  },

  getProperty (property, current, value) {
    const index = HelperDOM.getElementIndex(current)
    return {
      [property]: this.setEffectAtIndex(value, property, index)
    }
  },

  changeShadowColor (container, options = {}) {
    const section = container.closest('#effect-section')
    const [type, subtype] = this.getSectionTypes(section)
    const value = this.getModule(type).getDisplayedValue(section, subtype)
    const data = this.getModule(type).parseCSS(value)[0]
    const current = RightEffectCommon.getActiveElement(section)
    this.setElementData(current, type, subtype, data)
    ColorPickerCommon.setColor(this.getProperty(type, current, value), options)
  },

  deleteEffect (property, index) {
    RightCommon.changeStyle({
      [property]: this.removeEffectAtIndex(property, index)
    })
  },

  removeEffectAtIndex (type, index) {
    const values = this.getValuesArray(type)
    values.splice(index, 1)
    return values.join(this.getDelimiter(type))
  },

  sortEffects (property, from, to) {
    RightCommon.changeStyle({
      [property]: this.replaceEffectAtIndex(property, from, to)
    })
  },

  replaceEffectAtIndex (type, from, to) {
    const values = this.getValuesArray(type)
    const sorted = ExtendJS.insertAndShift(values, from, to)
    return sorted.join(this.getDelimiter(type))
  },

  moveEffect (section, type) {
    const li = RightEffectCommon.getActiveElement(section)
    if (li.dataset.type !== type) {
      this.deleteEffect(li.dataset.type, HelperDOM.getElementIndex(li))
      RightEffectCommon.moveActiveElement(section, li, type)
    }
  },

  injectListType (section, property) {
    const list = section.getElementsByClassName(`effect-list-${property}`)[0]
    const values = this.getModule(property).getParsedValues()
    console.log(values)
    for (const data of values) {
      const value = data.function || property
      this.insertElement(list, property, value, data)
    }
  },

  insertElement (list, property, value, data = {}) {
    const template = HelperDOM.getTemplate('template-effect-element')
    list.appendChild(template)
    if (!ExtendJS.isEmpty(data)) this.setElementData(template, property, value, data)
    return template
  },

  setElementData (elem, property, value, data) {
    elem.dataset.type = property
    elem.dataset.subtype = value
    const node = elem.getElementsByClassName('effect-name')[0]
    const name = this.getEffectName(elem, property, data.function)
    console.log(name)
    node.textContent = this.getElementName(property, data, name)
  },

  getEffectName (elem, type, subtype) {
    const data = JSON.parse(elem.closest('.effect-lists').dataset.names)
    return (type === 'filter' || type === 'transform')
      ? `${data[type]} ${data[subtype]}`
      : data[type]
  },

  getElementName (type, data, name) {
    return this.getModule(type).getElementName(data, name)
  }
}
