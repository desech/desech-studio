import HelperDOM from '../../../helper/HelperDOM.js'
import RightEffectList from './effect/RightEffectList.js'

export default {
  getSection (sectionData) {
    const template = this.getTemplate()
    this.injectData(template, sectionData)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-effect')
  },

  injectData (template, sectionData) {
    RightEffectList.injectList(template, sectionData)
  }
}
