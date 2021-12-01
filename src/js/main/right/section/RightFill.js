import HelperDOM from '../../../helper/HelperDOM.js'
import RightFillList from './fill/RightFillList.js'

export default {
  getSection (sectionData) {
    const template = this.getTemplate()
    this.injectData(template, sectionData)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-fill')
  },

  injectData (template, sectionData) {
    RightFillList.injectList(template, sectionData)
  }
}
