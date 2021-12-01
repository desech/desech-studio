import HelperDOM from '../../../helper/HelperDOM.js'
import ChangeStyleField from '../../../component/ChangeStyleField.js'
import RightGridTrack from './grid/RightGridTrack.js'

export default {
  getSection (sectionData) {
    const template = this.getTemplate()
    this.injectData(template, sectionData)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-grid')
  },

  injectData (template, sectionData) {
    ChangeStyleField.injectFields(template, sectionData)
    RightGridTrack.injectTrack(template, 'row', sectionData.style)
    RightGridTrack.injectTrack(template, 'column', sectionData.style)
  }
}
