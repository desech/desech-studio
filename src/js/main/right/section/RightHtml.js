import HelperDOM from '../../../helper/HelperDOM.js'
import RightHtmlMain from './html/RightHtmlMain.js'
import RightHtmlDetail from './html/RightHtmlDetail.js'
import RightHtmlAttribute from './html/RightHtmlAttribute.js'
import RightCommon from '../RightCommon.js'
import HelperElement from '../../../helper/HelperElement.js'
import StateSelectedElement from '../../../state/StateSelectedElement.js'
import HelperOverride from '../../../helper/HelperOverride.js'

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
    this.highlightOverides(template)
  },

  injectProperties (template) {
    const details = template.getElementsByClassName('slider-extra-container')[0]
    const container = HelperDOM.getTemplate('template-style-html-property')
    details.appendChild(container)
    const properties = HelperElement.getProperties(StateSelectedElement.getElement())
    RightCommon.injectPropertyFields(container, properties)
  },

  highlightOverides (container) {
    const element = StateSelectedElement.getElement()
    const overrides = HelperOverride.getSectionOverrides('html', element)
    console.log(overrides)
    this.highlightOveride(container, overrides?.tag, 'style-tag-dropdown')
    this.highlightOveride(container, overrides?.attributes?.hidden, 'style-html-show-hide')
    this.highlightOveride(container, overrides?.inner, 'style-html-svg-code')
    this.highlightOverideAttributes(container, overrides?.attributes)
  },

  highlightOveride (container, check, cls) {
    if (!check) return
    for (const node of container.getElementsByClassName(cls)) {
      node.classList.add('override')
    }
  },

  highlightOverideAttributes (container, attributes) {
    if (!attributes) return
    const fields = container.getElementsByClassName('style-html-details')[0]?.elements
    if (!fields) return
    for (const field of fields) {
      if (field.name in attributes) {
        field.classList.add('override')
      }
    }
  }
}
