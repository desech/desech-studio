import HelperDOM from '../../../helper/HelperDOM.js'
import RightCommon from '../RightCommon.js'

export default {
  getSection () {
    const template = HelperDOM.getTemplate('template-style-component')
    RightCommon.injectPropertyFields(template)
    return template
  }
}
