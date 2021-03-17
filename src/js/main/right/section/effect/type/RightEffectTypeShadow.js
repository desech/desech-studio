import StateStyleSheet from '../../../../../state/StateStyleSheet.js'
import HelperStyle from '../../../../../helper/HelperStyle.js'
import HelperDOM from '../../../../../helper/HelperDOM.js'
import RightEffectCommon from './RightEffectCommon.js'
import InputUnitField from '../../../../../component/InputUnitField.js'
import CheckButtonField from '../../../../../component/CheckButtonField.js'
import ColorPicker from '../../../../../component/ColorPicker.js'

export default {
  getTemplate () {
    return HelperDOM.getTemplate('template-effect-shadow')
  },

  getParsedValues () {
    const source = StateStyleSheet.getPropertyValue('box-shadow')
    return this.parseCSS(source)
  },

  parseCSS (source) {
    return HelperStyle.parseCSSValues(source, {
      valuesDelimiter: ', ',
      paramsDelimiter: ' '
    })
  },

  injectData (container, data) {
    RightEffectCommon.injectColor(container, HelperStyle.getParsedCSSParam(data, 0))
    this.injectOptions(container.closest('form').elements, data)
  },

  injectOptions (fields, data) {
    InputUnitField.setValue(fields.x, HelperStyle.getParsedCSSParam(data, 1) || this.getDefaultFieldValue('x'))
    InputUnitField.setValue(fields.y, HelperStyle.getParsedCSSParam(data, 2) || this.getDefaultFieldValue('y'))
    InputUnitField.setValue(fields.blur, HelperStyle.getParsedCSSParam(data, 3) || this.getDefaultFieldValue('blur'))
    InputUnitField.setValue(fields.spread, HelperStyle.getParsedCSSParam(data, 4) || this.getDefaultFieldValue('spread'))
    CheckButtonField.setValue(fields.inset, HelperStyle.getParsedCSSParam(data, 5))
  },

  getDefaultFieldValue (name) {
    switch (name) {
      case 'x': case 'y':
        return '1px'
      case 'blur':
        return '3px'
      case 'spread':
        return '0px'
    }
  },

  getDisplayedValue (section) {
    const fields = section.getElementsByClassName('slide-container')[0].elements
    return [
      ColorPicker.getColorPickerValue(section.getElementsByClassName('color-picker')[0]),
      InputUnitField.getValue(fields.x) || this.getDefaultFieldValue('x'),
      InputUnitField.getValue(fields.y) || this.getDefaultFieldValue('y'),
      InputUnitField.getValue(fields.blur) || this.getDefaultFieldValue('blur'),
      InputUnitField.getValue(fields.spread) || this.getDefaultFieldValue('spread'),
      CheckButtonField.getValue(fields.inset)
    ].join(' ')
  },

  getElementName (data, name) {
    const first = HelperStyle.getParsedCSSParam(data, 0)
    return `${name} ${RightEffectCommon.getColorHex(first)}`
  }
}
