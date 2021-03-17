import HelperDOM from '../../../helper/HelperDOM.js'
import RightFillList from './fill/RightFillList.js'

export default {
  getSection (style) {
    const template = this.getTemplate()
    this.injectData(template, style)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-fill')
  },

  injectData (template, style) {
    RightFillList.injectList(template)
  }
}
