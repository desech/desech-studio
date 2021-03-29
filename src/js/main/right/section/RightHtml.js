import HelperDOM from '../../../helper/HelperDOM.js'
import RightHtmlMain from './html/RightHtmlMain.js'
import RightHtmlDetail from './html/RightHtmlDetail.js'
import RightHtmlAttribute from './html/RightHtmlAttribute.js'
import RightCommon from '../RightCommon.js'

export default {
  getSection () {
    const template = this.getTemplate()
    this.injectData(template)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-html')
  },

  injectData (template) {
    RightHtmlMain.injectMain(template)
    RightHtmlDetail.injectDetails(template)
    RightHtmlAttribute.injectAttributes(template)
    this.injectProperties(template)
  },

  injectProperties (template) {
    const details = template.getElementsByClassName('html-details-container')[0]
    const container = HelperDOM.getTemplate('template-style-html-property')
    details.appendChild(container)
    RightCommon.injectPropertyFields(container)
  }
}
