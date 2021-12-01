import HelperDOM from '../../../helper/HelperDOM.js'
import ChangeStyleField from '../../../component/ChangeStyleField.js'
import RightTextFont from './text/RightTextFont.js'
import RightTextDecoration from './text/RightTextDecoration.js'
import SliderComponent from '../../../component/SliderComponent.js'
import ColorPickerButton from '../../../component/color-picker/ColorPickerButton.js'

export default {
  getSection (sectionData) {
    const template = this.getTemplate()
    this.injectData(template, sectionData)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-text')
  },

  injectData (template, sectionData) {
    ChangeStyleField.injectFields(template, sectionData)
    RightTextFont.injectFontList(template)
    RightTextFont.injectFontFamily(template)
    const colorContainer = template.querySelector('.color-button-wrapper[data-property="color"]')
    ColorPickerButton.injectPropertyColor(colorContainer)
    RightTextDecoration.injectTextDecorationLine(template)
    SliderComponent.setOpened(template)
  }
}
