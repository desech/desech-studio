import HelperDOM from '../../../helper/HelperDOM.js'
import RightCommon from '../RightCommon.js'
import StateSelectedElement from '../../../state/StateSelectedElement.js'
import HelperComponent from '../../../helper/HelperComponent.js'
import RightHtmlCommon from './html/RightHtmlCommon.js'
import HelperOverride from '../../../helper/HelperOverride.js'
import RightComponentVariant from './component/RightComponentVariant.js'

export default {
  getSection () {
    const template = HelperDOM.getTemplate('template-style-component')
    const element = StateSelectedElement.getElement()
    const data = HelperComponent.getComponentData(element)
    this.injectData(template, element, data)
    return template
  },

  injectData (template, element, data) {
    const overrides = HelperOverride.getOverrides(element, 'component')
    RightCommon.injectResetOverrides(template, overrides)
    this.injectComponentRef(template, data)
    this.injectComponentName(template, element, data)
    RightComponentVariant.injectVariants(template, overrides)
    this.injectComponentFile(template, data)
    RightCommon.injectPropertyFields(template, data.properties)
    this.highlightOverides(template, overrides)
  },

  injectComponentRef (container, data) {
    const node = container.getElementsByClassName('sidebar-title-text')[0]
    node.dataset.tooltip = data.ref
  },

  injectComponentName (container, element, data) {
    const node = container.getElementsByClassName('sidebar-component-name')[0]
    node.textContent = HelperComponent.getInstanceName(element, data.file)
  },

  injectComponentFile (container, data) {
    const field = container.getElementsByClassName('style-html-source-name')[0]
    RightHtmlCommon.setFileName(field, data.file)
  },

  highlightOverides (template, overrides) {
    HelperOverride.highlightOveride(template, overrides?.component, 'swap-component-button')
    HelperOverride.highlightOverideProperties(template, overrides?.properties)
    HelperOverride.highlightOverideWarning(template, overrides)
  }
}
