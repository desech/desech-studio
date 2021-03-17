import HelperDOM from '../../../helper/HelperDOM.js'
import RightCSSList from './css/RightCSSList.js'
import StyleSheetProperties from '../../../state/stylesheet/StyleSheetProperties.js'

export default {
  getSection () {
    const template = HelperDOM.getTemplate('template-style-css')
    this.injectData(template)
    return template
  },

  injectData (template) {
    const properties = StyleSheetProperties.getCustomProperties()
    RightCSSList.injectList(template.getElementsByClassName('add-css-dropdown')[0], properties)
  }
}
