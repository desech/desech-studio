import HelperDOM from '../../../helper/HelperDOM.js'
import RightCommon from '../RightCommon.js'
import StateSelectedElement from '../../../state/StateSelectedElement.js'
import HelperElement from '../../../helper/HelperElement.js'

export default {
  getSection () {
    const template = HelperDOM.getTemplate('template-style-component')
    this.injectComponentName(template)
    RightCommon.injectPropertyFields(template)
    return template
  },

  injectComponentName (container) {
    const node = container.getElementsByClassName('sidebar-component-name')[0]
    const selected = StateSelectedElement.getElement()
    node.textContent = HelperElement.getComponentName(selected)
  }
}
