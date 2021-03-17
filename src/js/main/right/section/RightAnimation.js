import HelperDOM from '../../../helper/HelperDOM.js'
import RightAnimationList from './animation/RightAnimationList.js'

export default {
  getSection (style) {
    const template = this.getTemplate()
    this.injectData(template, style)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-animation')
  },

  injectData (template, style) {
    RightAnimationList.injectList(template)
  }
}
