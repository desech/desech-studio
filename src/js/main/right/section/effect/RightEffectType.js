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

  async clickEffectFieldsEvent (event) {
    if (event.target.closest('.effect-form-container .effect-button')) {
      await this.changeEffectFields(event.target.closest('#effect-section'))
    }
  },

  async changeEffectFieldsEvent (event) {
    if (event.target.closest('.effect-form-container .effect-field') ||
      event.target.closest('.effect-form-container .timing-field')) {
      await this.changeEffectFields(event.target.closest('#effect-section'))
    }
  },

  async colorchangeShadowEvent (event) {
    if (event.target.closest('.effect-form-container .color-picker')) {
      await this.changeShadowColor(event.target, event.detail)
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

  async setEffect (section, type, subtype) {
    const current = RightEffectCommon.getActiveElement(section)
    const value = this.getModule(type).getDisplayedValue(section, subtype)
    const data = this.getModule(type).parseCSS(value)[0]
    this.setElementData(current, type, subtype, data)
    await RightCommon.changeStyle(this.getProperty(type, current, value))
  },

  getDelimiter (type) {
    return (type === 'box-shadow' || type === 'transition') ? ', ' : ' '
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

  async changeEffectFields (section) {
    const [type, subtype] = this.getSectionTypes(section)
    await this.setEffect(section, type, subtype)
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

  async changeShadowColor (container, options = {}) {
    const section = container.closest('#effect-section')
    const [type, subtype] = this.getSectionTypes(section)
    const value = this.getModule(type).getDisplayedValue(section, subtype)
    const data = this.getModule(type).parseCSS(value)[0]
    const current = RightEffectCommon.getActiveElement(section)
    this.setElementData(current, type, subtype, data)
    await ColorPickerCommon.setColor(this.getProperty(type, current, value), options)
  },

  async deleteEffect (property, index) {
    await RightCommon.changeStyle({
      [property]: this.removeEffectAtIndex(property, index)
    })
  },

  removeEffectAtIndex (type, index) {
    const values = this.getValuesArray(type)
    values.splice(index, 1)
    return values.join(this.getDelimiter(type))
  },

  async sortEffects (property, from, to) {
    await RightCommon.changeStyle({
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
    for (const data of values) {
      const subtype = this.getSubtype(property, data)
      this.insertElement(list, property, subtype, data)
    }
  },

  getSubtype (property, data) {
    if (RightEffectCommon.isGeneralValue(data.value)) {
      return data.value
    } else if (property === 'filter' || property === 'transform') {
      return data.function
    } else {
      return property
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
    node.textContent = this.getEffectName(elem, property, value, data)
  },

  getEffectName (elem, property, value, data) {
    const text = JSON.parse(elem.closest('.effect-lists').dataset.names)
    if (RightEffectCommon.isGeneralValue(value)) {
      return `${text[property]} ${text[value]}`
    }
    const label = (['filter', 'transform'].includes(property))
      ? `${text[property]} ${text[value]}`
      : text[property]
    const extra = this.getModule(property).getLabelExtra(data)
    return `${label} ${extra}`
  }
}
