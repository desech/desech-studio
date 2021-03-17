import HelperDOM from '../../../helper/HelperDOM.js'
import ChangeStyleField from '../../../component/ChangeStyleField.js'
import HelperElement from '../../../helper/HelperElement.js'
import StateSelectedElement from '../../../state/StateSelectedElement.js'

export default {
  getSection (style) {
    const element = StateSelectedElement.getElement()
    if (!HelperElement.isContainerChild(element)) return
    const template = this.getTemplate()
    this.injectData(template, style)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-position')
  },

  injectData (template, style) {
    ChangeStyleField.injectFields(template, style)
  }
}
