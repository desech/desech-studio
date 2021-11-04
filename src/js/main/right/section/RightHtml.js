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

  highlightOverides (template) {
    const element = StateSelectedElement.getElement()
    const type = HelperElement.getType(element)
    const overrides = HelperOverride.getSectionOverrides('html', element)
    HelperOverride.highlightOveride(template, overrides?.tag, 'style-tag-dropdown')
    HelperOverride.highlightOveride(template, overrides?.inner, 'style-html-inner-field')
    HelperOverride.highlightOverideAttributes(template, overrides?.attributes)
    HelperOverride.highlightOverideCustomAttributes(template, overrides?.attributes)
    HelperOverride.highlightOverideProperties(template, overrides?.properties)
    HelperOverride.highlightOverideWarning(template, overrides, type)
  }
}
