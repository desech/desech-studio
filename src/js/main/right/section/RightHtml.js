import HelperDOM from '../../../helper/HelperDOM.js'
import RightHtmlMain from './html/RightHtmlMain.js'
import RightHtmlDetail from './html/RightHtmlDetail.js'
import RightHtmlAttribute from './html/RightHtmlAttribute.js'
import RightHtmlProperty from './html/RightHtmlProperty.js'

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
    RightHtmlProperty.injectProperties(template)
  }
}
