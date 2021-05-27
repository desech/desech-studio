import StateStyleSheet from '../../../../../state/StateStyleSheet.js'
import ColorPicker from '../../../../../component/ColorPicker.js'
import InputUnitField from '../../../../../component/InputUnitField.js'
import HelperDOM from '../../../../../helper/HelperDOM.js'
import HelperStyle from '../../../../../helper/HelperStyle.js'
import RightEffectCommon from './RightEffectCommon.js'

export default {
  getTemplate (type) {
    const name = ['drop-shadow', 'hue-rotate', 'blur'].includes(type) ? type : 'other'
    return HelperDOM.getTemplate(`template-effect-filter-${name}`)
  },

  getParsedValues () {
    const value = StateStyleSheet.getPropertyValue('filter')
    if (RightEffectCommon.isGeneralValue(value)) return [{ value }]
    return this.parseCSS(value)
  },

  parseCSS (source) {
    return HelperStyle.parseCSSValues(source, {
      valuesDelimiter: ' ',
      paramsDelimiter: ' '
    })
  },

  injectData (container, data, type) {
    if (type === 'drop-shadow') {
      const rgb = HelperStyle.getParsedCSSParam(data, 0)
      RightEffectCommon.injectColor(container, rgb)
    }
    this.injectOptions(container.closest('form').elements, data, type)
  },

  injectOptions (fields, data, type) {
    const values = this.getOptionValues(data, type)
    InputUnitField.setValue(fields.x, values.x)
    InputUnitField.setValue(fields.y, values.y)
    InputUnitField.setValue(fields.blur, values.blur)
    InputUnitField.setValue(fields.amount, values.amount)
  },

  getOptionValues (data, type) {
    return {
      x: HelperStyle.getParsedCSSParam(data, 1) || this.getDefaultShadowValue('x'),
      y: HelperStyle.getParsedCSSParam(data, 2) || this.getDefaultShadowValue('y'),
      blur: HelperStyle.getParsedCSSParam(data, 3) || this.getDefaultShadowValue('blur'),
      amount: HelperStyle.getParsedCSSParam(data, 0) || this.getDefaultFilterValue(type)
    }
  },

  getDefaultShadowValue (name) {
    switch (name) {
      case 'x':
      case 'y':
        return '1px'
      case 'blur':
        return '3px'
    }
  },

  getDefaultFilterValue (type) {
    switch (type) {
      case 'opacity':
        return '100%'
      case 'blur':
        return '5px'
      case 'brightness':
        return '200%'
      case 'contrast':
        return '200%'
      case 'hue-rotate':
        return '180deg'
      case 'saturate':
        return '200%'
      case 'grayscale':
        return '100%'
      case 'sepia':
        return '100%'
      case 'invert':
        return '100%'
    }
  },

  getDisplayedValue (section, type) {
    const fields = section.getElementsByClassName('slide-container')[0].elements
    return (type === 'drop-shadow')
      ? this.getDropShadowFilterValue(section, fields)
      : this.getFilterValue(type, fields)
  },

  getDropShadowFilterValue (section, fields) {
    const picker = section.getElementsByClassName('color-picker')[0]
    const color = ColorPicker.getColorPickerValue(picker)
    const { x, y, blur } = this.getDropShadowFilterOptions(fields)
    return `drop-shadow(${color} ${x} ${y} ${blur})`
  },

  getDropShadowFilterOptions (fields) {
    return {
      x: InputUnitField.getValue(fields.x) || this.getDefaultShadowValue('x'),
      y: InputUnitField.getValue(fields.y) || this.getDefaultShadowValue('y'),
      blur: InputUnitField.getValue(fields.blur) || this.getDefaultShadowValue('blur')
    }
  },

  getFilterValue (type, fields) {
    const amount = InputUnitField.getValue(fields.amount) ||
      this.getDefaultFilterValue(type)
    return `${type}(${amount})`
  },

  getLabelExtra (data) {
    const first = HelperStyle.getParsedCSSParam(data, 0)
    return (data.function === 'drop-shadow') ? RightEffectCommon.getColorHex(first) : first
  }
}
