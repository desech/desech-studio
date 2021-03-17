import HelperDOM from '../../../helper/HelperDOM.js'
import RightBorderRadius from './border/RightBorderRadius.js'
import RightBorderSide from './border/RightBorderSide.js'

export default {
  getSection (style) {
    const template = this.getTemplate()
    this.injectData(template, style)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-border')
  },

  injectData (template, style) {
    RightBorderRadius.injectRadius(template, style)
    RightBorderSide.injectSide(template, style)
  }
}
