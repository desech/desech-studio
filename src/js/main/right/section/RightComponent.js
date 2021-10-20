import HelperDOM from '../../../helper/HelperDOM.js'
import RightCommon from '../RightCommon.js'
import StateSelectedElement from '../../../state/StateSelectedElement.js'
import HelperComponent from '../../../helper/HelperComponent.js'

export default {
  getSection () {
    const template = HelperDOM.getTemplate('template-style-component')
    this.injectComponentName(template)
    this.injectComponentProperties(template)
    return template
  },

  injectComponentName (container) {
    const node = container.getElementsByClassName('sidebar-component-name')[0]
    const selected = StateSelectedElement.getElement()
    node.textContent = HelperComponent.getInstanceName(selected)
  },

  injectComponentProperties (template) {
    const element = StateSelectedElement.getElement()
    const properties = HelperComponent.getInstanceProperties(element)
    RightCommon.injectPropertyFields(template, properties)
  }
}
