import HelperDOM from '../../../helper/HelperDOM.js'
import ChangeStyleField from '../../../component/ChangeStyleField.js'
import RightSizeMargin from './size/RightSizeMargin.js'

export default {
  getSection (sectionData) {
    const template = this.getTemplate()
    this.injectData(template, sectionData)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-size')
  },

  injectData (template, sectionData) {
    ChangeStyleField.injectFields(template, sectionData)
    RightSizeMargin.injectFields(template, sectionData)
    RightSizeMargin.injectConstraints(template)
  }
}
