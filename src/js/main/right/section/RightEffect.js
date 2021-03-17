import HelperDOM from '../../../helper/HelperDOM.js'
import RightEffectList from './effect/RightEffectList.js'

export default {
  getSection (style) {
    const template = this.getTemplate()
    this.injectData(template, style)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-effect')
  },

  injectData (template, style) {
    RightEffectList.injectList(template)
  }
}
