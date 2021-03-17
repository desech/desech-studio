import HelperDOM from '../../../helper/HelperDOM.js'
import ChangeStyleField from '../../../component/ChangeStyleField.js'
import RightSizeMargin from './size/RightSizeMargin.js'

export default {
  getSection (style) {
    const template = this.getTemplate()
    this.injectData(template, style)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-size')
  },

  injectData (template, style) {
    ChangeStyleField.injectFields(template, style)
    RightSizeMargin.injectFields(template, style)
    RightSizeMargin.injectConstraints(template)
  }
}
