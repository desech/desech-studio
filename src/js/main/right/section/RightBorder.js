import HelperDOM from '../../../helper/HelperDOM.js'
import RightBorderRadius from './border/RightBorderRadius.js'
import RightBorderSide from './border/RightBorderSide.js'
import RightVariableInject from './variable/RightVariableInject.js'

export default {
  getSection (sectionData) {
    const template = this.getTemplate()
    this.injectData(template, sectionData)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-border')
  },

  injectData (form, sectionData) {
    RightVariableInject.injectAllFieldVariables(form.elements)
    RightBorderRadius.injectRadius(form, sectionData)
    RightBorderSide.injectSide(form, sectionData)
    RightVariableInject.updateAllFieldVariables(form.elements)
  }
}
