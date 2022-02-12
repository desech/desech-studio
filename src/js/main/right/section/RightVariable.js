import HelperDOM from '../../../helper/HelperDOM.js'
import StateSelectedVariable from '../../../state/StateSelectedVariable.js'
import ChangeStyleField from '../../../component/ChangeStyleField.js'
import ColorPickerSolidColor from '../../../component/color-picker/ColorPickerSolidColor.js'
import HelperColor from '../../../helper/HelperColor.js'
import StyleSheetVariable from '../../../state/stylesheet/StyleSheetVariable.js'
import RightTextFont from './text/RightTextFont.js'
import RightTextDecoration from './text/RightTextDecoration.js'
import InputUnitField from '../../../component/InputUnitField.js'
import HelperRegex from '../../../helper/HelperRegex.js'

export default {
  getSection () {
    const template = this.getTemplate()
    this.injectData(template)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-variable')
  },

  injectData (template) {
    const data = StateSelectedVariable.getVariable()
    const fields = template.getElementsByClassName('right-variable-form')[0].elements
    this.injectRef(template, data)
    fields.name.value = data.name
    fields.type.value = data.type
    this.injectValue(template, fields, data)
  },

  injectRef (container, data) {
    const node = container.getElementsByClassName('right-variable-ref')[0]
    node.textContent = data.ref
  },

  injectValue (container, fields, data) {
    const parent = container.getElementsByClassName('right-variable-value-container')[0]
    const template = HelperDOM.getTemplate(`template-variable-${data.type}`)
    HelperDOM.replaceOnlyChild(parent, template)
    this.injectFieldValue(parent, fields, data)
  },

  injectFieldValue (container, fields, data) {
    if (data.type === 'font-family') {
      RightTextFont.injectFontList(container)
      RightTextFont.injectFontFamily(container, data.value)
    } else if (data.type === 'text-decoration-line') {
      RightTextDecoration.injectDecorationLine(fields, data.value)
    } else if (data.type === 'border-radius') {
      this.injectBorderRadius(fields, data)
    } else if (data.type !== 'color') {
      const field = container.querySelector('input,select,button')
      ChangeStyleField.setValue(field, data.value)
    }
  },

  injectBorderRadius (fields, data) {
    const [first, last] = HelperRegex.splitByCharacter(data.value, ' ')
    InputUnitField.setValue(fields['border-radius'], first)
    InputUnitField.setValue(fields['border-radius-vertical'], last)
  },

  // inject things after the template is added to the container
  injectAfterAppend (container) {
    const data = StateSelectedVariable.getVariable()
    this.injectColorPicker(container, data)
  },

  injectColorPicker (container, data) {
    if (data.type !== 'color') return
    const color = StyleSheetVariable.getVariableValue(data.ref)
    const rgb = HelperColor.extractRgb(color)
    ColorPickerSolidColor.injectColor(container, rgb)
  }
}
