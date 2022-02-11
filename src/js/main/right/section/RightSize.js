import HelperDOM from '../../../helper/HelperDOM.js'
import ChangeStyleField from '../../../component/ChangeStyleField.js'
import RightSizeMargin from './size/RightSizeMargin.js'
import RightVariableInject from './variable/RightVariableInject.js'

export default {
  getSection (sectionData) {
    const template = this.getTemplate()
    this.injectData(template, sectionData)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-size')
  },

  injectData (form, sectionData) {
    RightVariableInject.injectAllFieldVariables(form.elements)
    ChangeStyleField.injectFields(form, sectionData)
    RightSizeMargin.injectFields(form, sectionData)
    RightSizeMargin.injectConstraints(form, sectionData.style)
    RightVariableInject.updateAllFieldVariables(form.elements)
  }
}
