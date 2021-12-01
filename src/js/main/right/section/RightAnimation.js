import HelperDOM from '../../../helper/HelperDOM.js'
import RightAnimationList from './animation/RightAnimationList.js'

export default {
  getSection (sectionData) {
    const template = this.getTemplate()
    this.injectData(template, sectionData)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-animation')
  },

  injectData (template, sectionData) {
    RightAnimationList.injectPlayButtons(template)
    RightAnimationList.injectList(template, sectionData)
  }
}
