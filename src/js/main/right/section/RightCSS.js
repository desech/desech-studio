import HelperDOM from '../../../helper/HelperDOM.js'
import RightCSSList from './css/RightCSSList.js'
import StyleSheetProperties from '../../../state/stylesheet/StyleSheetProperties.js'

export default {
  getSection (sectionData) {
    const template = HelperDOM.getTemplate('template-style-css')
    this.injectData(template, sectionData)
    return template
  },

  injectData (template, sectionData) {
    const select = template.getElementsByClassName('add-css-dropdown')[0]
    const properties = StyleSheetProperties.getCustomProperties(sectionData.style)
    RightCSSList.injectList(select, properties)
  }
}
