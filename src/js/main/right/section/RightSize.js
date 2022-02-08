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
    ChangeStyleField.injectFields(form, sectionData)
    RightVariableInject.injectInputUnitFields(form.elements)
    RightSizeMargin.injectFields(form, sectionData)
    RightSizeMargin.injectConstraints(form)
  }
}
