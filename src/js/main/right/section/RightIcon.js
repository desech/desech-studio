import HelperDOM from '../../../helper/HelperDOM.js'
import ChangeStyleField from '../../../component/ChangeStyleField.js'
import ColorPickerButton from '../../../component/color-picker/ColorPickerButton.js'
import RightVariableInject from './variable/RightVariableInject.js'

export default {
  getSection (sectionData) {
    const template = this.getTemplate()
    this.injectData(template, sectionData)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-icon')
  },

  injectData (form, sectionData) {
    RightVariableInject.injectAllFieldVariables(form.elements)
    ChangeStyleField.injectFields(form, sectionData)
    this.injectColors(form, sectionData)
    RightVariableInject.updateAllFieldVariables(form.elements)
  },

  injectColors (form, sectionData) {
    const fill = form.querySelector('.color-button-wrapper[data-property="fill"]')
    ColorPickerButton.injectPropertyColor(fill, sectionData.style)
    const stroke = form.querySelector('.color-button-wrapper[data-property="stroke"]')
    ColorPickerButton.injectPropertyColor(stroke, sectionData.style)
  }
}
