import HelperDOM from '../../../helper/HelperDOM.js'
import HelperStyle from '../../../helper/HelperStyle.js'
import StateSelectedElement from '../../../state/StateSelectedElement.js'
import RightSelectorCommon from './selector/RightSelectorCommon.js'
import StyleSheetSelector from '../../../state/stylesheet/StyleSheetSelector.js'

export default {
  getSection () {
    const template = this.getTemplate()
    this.injectData(template)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-selector')
  },

  injectData (template) {
    this.injectDefaultSelector(template)
    const selectors = StyleSheetSelector.getDisplayElementSelectors()
    this.injectSelectors(selectors, template)
    this.activateSelector(template)
  },

  injectDefaultSelector (container) {
    const selector = StyleSheetSelector.getDefaultSelector()
    const element = this.getSelectorElement(selector, container)
    container.getElementsByClassName('default-selector-list')[0].appendChild(element)
  },

  injectSelectors (selectors, template) {
    const refList = template.getElementsByClassName('ref-selector-list')[0]
    const classList = template.getElementsByClassName('class-selector-list')[0]
    for (const selector of selectors) {
      if (this.isDefaultSelector(selector)) continue
      this.injectSelector(selector, template, refList, classList)
    }
  },

  isDefaultSelector (selector) {
    const title = HelperStyle.getSelectorLabel(selector, StateSelectedElement.getRef())
    // empty title means default selector
    return !title
  },

  injectSelector (selector, template, refList, classList) {
    const element = this.getSelectorElement(selector, template)
    const classSelector = HelperStyle.isClassSelector(selector)
    classSelector ? classList.appendChild(element) : refList.appendChild(element)
  },

  getSelectorElement (selector, container) {
    const element = HelperDOM.getTemplate('template-style-selector-element')
    this.prefillSelector(element, selector)
    return element
  },

  prefillSelector (element, selector) {
    element.dataset.selector = selector
    const title = HelperStyle.getSelectorLabel(selector, StateSelectedElement.getRef())
    const isDefault = (title === '')
    this.prefillSelectorDrag(element, !isDefault)
    this.prefillSelectorTitle(element, title)
    this.prefillSelectorButtons(selector, element, !isDefault)
  },

  prefillSelectorDrag (element, show) {
    if (!show) return
    const button = element.getElementsByClassName('sort-selector-button')[0]
    button.style.removeProperty('visibility')
  },

  prefillSelectorTitle (element, title) {
    if (!title) return
    const node = element.getElementsByClassName('selector-title')[0]
    node.textContent = title
    node.dataset.tooltip = title
  },

  prefillSelectorButtons (selector, element, show) {
    if (!show) return
    HelperDOM.show(element.getElementsByClassName('list-elem-buttons')[0])
    if (HelperStyle.isClassSelector(selector)) {
      HelperDOM.show(element.getElementsByClassName('unlink-class-button')[0])
    }
  },

  activateSelector (container) {
    const element = container.querySelector('.class-selector-list li') ||
      container.querySelector('.default-selector-list li')
    RightSelectorCommon.activateSelector(element, container)
  }
}
