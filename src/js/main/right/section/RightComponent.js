import HelperDOM from '../../../helper/HelperDOM.js'
import RightComponentProperty from './component/RightComponentProperty.js'

export default {
  getSection () {
    const template = HelperDOM.getTemplate('template-style-component')
    RightComponentProperty.injectProperties(template)
    return template
  }
}
