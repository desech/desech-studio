import HelperDOM from '../../../helper/HelperDOM.js'
import RightBorderRadius from './border/RightBorderRadius.js'
import RightBorderSide from './border/RightBorderSide.js'

export default {
  getSection (sectionData) {
    const template = this.getTemplate()
    this.injectData(template, sectionData)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-border')
  },

  injectData (template, sectionData) {
    RightBorderRadius.injectRadius(template, sectionData)
    RightBorderSide.injectSide(template, sectionData)
  }
}
