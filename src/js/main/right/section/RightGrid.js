import HelperDOM from '../../../helper/HelperDOM.js'
import ChangeStyleField from '../../../component/ChangeStyleField.js'
import RightGridTrack from './grid/RightGridTrack.js'

export default {
  getSection (style) {
    const template = this.getTemplate()
    this.injectData(template, style)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-grid')
  },

  injectData (template, style) {
    ChangeStyleField.injectFields(template, style)
    RightGridTrack.injectTrack(template, 'row')
    RightGridTrack.injectTrack(template, 'column')
  }
}
