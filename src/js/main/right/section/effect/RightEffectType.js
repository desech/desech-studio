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
      shadow: RightEffectTypeShadow,
      transform: RightEffectTypeTransform,
      transition: RightEffectTypeTransition,
      blend: RightEffectTypeBlend
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
    if (event.target.closest('.effect-form-container .effect-field') || event.target.closest('.effect-form-container .timing-field')) {
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
    RightCommon.changeStyle(this.getProperty(type, subtype, current, value))
  },

  getPropertyName (type, subtype) {
    return (type === 'shadow' || type === 'blend') ? subtype : type
  },

  getDefaultSubtype (type) {
    switch (type) {
      case 'shadow':
        return 'box-shadow'
      case 'transition':
        return 'transition'
      case 'blend':
        return 'mix-blend-mode'
    }
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

  getProperty (type, subtype, current, value) {
    return {
      [this.getPropertyName(type, subtype)]: this.setEffectAtIndex(value, type, HelperDOM.getElementIndex(current))
    }
  },

  changeShadowColor (container, options = {}) {
    const section = container.closest('#effect-section')
    const [type, subtype] = this.getSectionTypes(section)
    const value = this.getModule(type).getDisplayedValue(section, subtype)
    const data = this.getModule(type).parseCSS(value)[0]
    const current = RightEffectCommon.getActiveElement(section)
    this.setElementData(current, type, subtype, data)
    ColorPickerCommon.setColor(this.getProperty(type, subtype, current, value), options)
  },

  deleteEffect (type, subtype, index) {
    RightCommon.changeStyle({
      [this.getPropertyName(type, subtype)]: this.removeEffectAtIndex(type, index)
    })
  },

  removeEffectAtIndex (type, index) {
    const values = this.getValuesArray(type)
    values.splice(index, 1)
    return values.join(this.getDelimiter(type))
  },

  sortEffects (type, subtype, from, to) {
    RightCommon.changeStyle({
      [this.getPropertyName(type, subtype)]: this.replaceEffectAtIndex(type, from, to)
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
      this.deleteEffect(li.dataset.type, li.dataset.subtype, HelperDOM.getElementIndex(li))
      RightEffectCommon.moveActiveElement(section, li, type)
    }
  },

  injectListType (section, type) {
    const list = section.getElementsByClassName(`effect-list-${type}`)[0]
    const values = this.getModule(type).getParsedValues()
    for (const data of values) {
      const subtype = data.function || this.getDefaultSubtype(type)
      this.insertElement(list, type, subtype, data)
    }
  },

  insertElement (list, type, subtype, data = {}) {
    const template = HelperDOM.getTemplate('template-effect-element')
    list.appendChild(template)
    if (!ExtendJS.isEmpty(data)) this.setElementData(template, type, subtype, data)
    return template
  },

  setElementData (elem, type, subtype, data) {
    elem.dataset.type = type
    elem.dataset.subtype = subtype
    const name = this.getEffectName(elem, type, data.function)
    elem.getElementsByClassName('effect-name')[0].textContent = this.getElementName(type, data, name)
  },

  getEffectName (elem, type, subtype) {
    const data = JSON.parse(elem.closest('.effect-lists').dataset.names)
    return (type === 'filter' || type === 'transform') ? `${data[type]} ${data[subtype]}` : data[type]
  },

  getElementName (type, data, name) {
    return this.getModule(type).getElementName(data, name)
  }
}
