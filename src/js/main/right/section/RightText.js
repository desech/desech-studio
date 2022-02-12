import HelperDOM from '../../../helper/HelperDOM.js'
import ChangeStyleField from '../../../component/ChangeStyleField.js'
import RightTextFont from './text/RightTextFont.js'
import RightTextDecoration from './text/RightTextDecoration.js'
import SliderComponent from '../../../component/SliderComponent.js'
import ColorPickerButton from '../../../component/color-picker/ColorPickerButton.js'
import RightVariableInject from './variable/RightVariableInject.js'

export default {
  getSection (sectionData) {
    const template = this.getTemplate()
    this.injectData(template, sectionData)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-text')
  },

  injectData (form, sectionData) {
    RightVariableInject.injectAllFieldVariables(form.elements)
    this.injectFields(form, sectionData)
    RightVariableInject.updateAllFieldVariables(form.elements)
  },

  injectFields (form, sectionData) {
    ChangeStyleField.injectFields(form, sectionData)
    this.injectFontFamily(form, sectionData)
    const colorContainer = form.querySelector('.color-button-wrapper[data-property="color"]')
    ColorPickerButton.injectPropertyColor(colorContainer, sectionData.style)
    RightTextDecoration.injectTextDecorationLine(form, sectionData.style)
    SliderComponent.setOpened(form)
  },

  injectFontFamily (form, sectionData) {
    RightTextFont.injectFontList(form)
    RightTextFont.injectFontFamily(form, sectionData.style['font-family'])
  }
}
