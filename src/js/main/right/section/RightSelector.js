import HelperDOM from '../../../helper/HelperDOM.js'
import HelperStyle from '../../../helper/HelperStyle.js'
import StateSelectedElement from '../../../state/StateSelectedElement.js'
import RightSelectorCommon from './selector/RightSelectorCommon.js'
import StyleSheetSelector from '../../../state/stylesheet/StyleSheetSelector.js'
import HelperOverride from '../../../helper/HelperOverride.js'

export default {
  getSection (sectionData) {
    const template = this.getTemplate()
    this.injectData(template)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-selector')
  },

  injectData (template) {
    // @todo in the future show all selectors for that element like dev tools
    // use `element.is(rules[i].selectorText)`
    this.injectDefaultSelector(template)
    const selectors = StyleSheetSelector.getDisplayElementSelectors()
    this.injectSelectors(selectors, template)
    this.activateSelector(template)
    this.highlightOverides(template)
  },

  injectDefaultSelector (container) {
    const selector = StyleSheetSelector.getDefaultSelector()
    const record = this.getSelectorRecord(selector, container)
    container.getElementsByClassName('default-selector-list')[0].appendChild(record)
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
    const title = HelperStyle.getSelectorLabel(selector, StateSelectedElement.getStyleRef())
    // empty title means default selector
    return !title
  },

  injectSelector (selector, template, refList, classList) {
    const record = this.getSelectorRecord(selector, template)
    const classSelector = HelperStyle.isClassSelector(selector)
    classSelector ? classList.appendChild(record) : refList.appendChild(record)
  },

  getSelectorRecord (selector, container) {
    const record = HelperDOM.getTemplate('template-style-selector-element')
    this.prefillSelector(record, selector)
    return record
  },

  prefillSelector (record, selector) {
    record.dataset.selector = selector
    const title = HelperStyle.getSelectorLabel(selector, StateSelectedElement.getStyleRef())
    const isDefault = (title === '')
    this.prefillSelectorDrag(record, !isDefault)
    this.prefillSelectorTitle(record, title)
    this.prefillSelectorButtons(selector, record, !isDefault)
  },

  prefillSelectorDrag (record, show) {
    if (!show) return
    const button = record.getElementsByClassName('sort-selector-button')[0]
    button.style.removeProperty('visibility')
  },

  prefillSelectorTitle (record, title) {
    if (!title) return
    const node = record.getElementsByClassName('selector-title')[0]
    node.textContent = title
    node.dataset.tooltip = title
  },

  prefillSelectorButtons (selector, record, show) {
    if (!show) return
    HelperDOM.show(record.getElementsByClassName('list-elem-buttons')[0])
    if (HelperStyle.isClassSelector(selector)) {
      HelperDOM.show(record.getElementsByClassName('unlink-class-button')[0])
    }
  },

  activateSelector (container) {
    const record = container.querySelector('.class-selector-list li') ||
      container.querySelector('.default-selector-list li')
    RightSelectorCommon.activateSelector(record, container)
  },

  highlightOverides (template) {
    const element = StateSelectedElement.getElement()
    const overrides = HelperOverride.getNodeFullOverrides(element, 'element')
    HelperOverride.highlightOverideClasses(template, overrides?.classes)
    HelperOverride.highlightOverideClassesWarning(template, overrides?.classes)
  }
}
