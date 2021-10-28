import HelperDOM from '../../../helper/HelperDOM.js'
import RightCommon from '../RightCommon.js'
import StateSelectedElement from '../../../state/StateSelectedElement.js'
import HelperComponent from '../../../helper/HelperComponent.js'
import RightHtmlCommon from './html/RightHtmlCommon.js'

export default {
  getSection () {
    const template = HelperDOM.getTemplate('template-style-component')
    const element = StateSelectedElement.getElement()
    const data = HelperComponent.getComponentData(element)
    this.injectComponentName(template, element, data)
    this.injectComponentFile(template, data)
    this.injectComponentProperties(template, data)
    return template
  },

  injectComponentName (container, element, data) {
    const node = container.getElementsByClassName('sidebar-component-name')[0]
    node.textContent = HelperComponent.getInstanceName(element, data.file)
  },

  injectComponentFile (container, data) {
    const field = container.getElementsByClassName('style-html-source-name')[0]
    RightHtmlCommon.setFileName(field, data.file)
  },

  injectComponentProperties (container, data) {
    RightCommon.injectPropertyFields(container, data.properties)
  }
}
