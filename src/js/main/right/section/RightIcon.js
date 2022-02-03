import HelperDOM from '../../../helper/HelperDOM.js'
import ChangeStyleField from '../../../component/ChangeStyleField.js'
import ColorPickerButton from '../../../component/color-picker/ColorPickerButton.js'

export default {
  getSection (sectionData) {
    const template = this.getTemplate()
    this.injectData(template, sectionData)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-icon')
  },

  injectData (template, sectionData) {
    ChangeStyleField.injectFields(template, sectionData)
    const fill = template.querySelector('.color-button-wrapper[data-property="fill"]')
    ColorPickerButton.injectPropertyColor(fill, sectionData.style)
    const stroke = template.querySelector('.color-button-wrapper[data-property="stroke"]')
    ColorPickerButton.injectPropertyColor(stroke, sectionData.style)
  }
}
