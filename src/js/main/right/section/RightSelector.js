import HelperDOM from '../../../helper/HelperDOM.js'
import HelperStyle from '../../../helper/HelperStyle.js'
import StateSelectedElement from '../../../state/StateSelectedElement.js'
import RightSelectorCommon from './selector/RightSelectorCommon.js'
import StyleSheetSelector from '../../../state/stylesheet/StyleSheetSelector.js'
import HelperOverride from '../../../helper/HelperOverride.js'
import HelperLocalStore from '../../../helper/HelperLocalStore.js'
import HelperTrigger from '../../../helper/HelperTrigger.js'

export default {
  getSection (sectionData) {
    const template = this.getTemplate()
    this.injectData(template, sectionData)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-selector')
  },

  injectData (template, sectionData) {
    // @todo in the future show all selectors for that element like dev tools
    // use `element.is(rules[i].selectorText)`
    const ref = StateSelectedElement.getStyleRef()
    this.injectDefaultSelector(template, ref)
    const selectors = StyleSheetSelector.getDisplayElementSelectors()
    this.injectSelectors(selectors, template, ref)
    this.activateNonDefaultSelector(template)
    this.highlightOverides(template, ref, sectionData.overrides.element)
  },

  injectDefaultSelector (container, ref) {
    const selector = StyleSheetSelector.getDefaultSelector()
    const record = this.getSelectorRecord(selector, container, ref)
    container.getElementsByClassName('default-selector-list')[0].appendChild(record)
  },

  injectSelectors (selectors, template, ref) {
    const lists = this.getLists(template)
    for (const selector of selectors) {
      if (this.isDefaultSelector(selector, ref)) continue
      this.injectSelector(selector, template, lists, ref)
    }
  },

  getLists (template) {
    const lists = {}
    for (const list of template.getElementsByClassName('selector-list')) {
      lists[list.dataset.type] = list
    }
    return lists
  },

  isDefaultSelector (selector, ref) {
    const title = HelperStyle.getSelectorLabel(selector, ref)
    // empty title means default selector
    return !title
  },

  injectSelector (selector, template, lists, ref) {
    const type = this.getRecordType(selector)
    const record = this.getSelectorRecord(selector, template, ref, type)
    lists[type].appendChild(record)
  },

  getRecordType (selector) {
    if (HelperStyle.isVariantSelector(selector)) {
      return 'variant'
    } else if (HelperStyle.isClassSelector(selector)) {
      return 'class'
    } else {
      return 'ref'
    }
  },

  getSelectorRecord (selector, container, ref, type) {
    const record = HelperDOM.getTemplate('template-style-selector-element')
    this.prefillSelector(record, selector, ref, type)
    return record
  },

  prefillSelector (record, selector, ref, type) {
    record.dataset.selector = selector
    const title = HelperStyle.getSelectorLabel(selector, ref, type)
    const isDefault = (title === '')
    this.prefillSelectorDrag(record, !isDefault)
    this.prefillSelectorTitle(record, title)
    this.prefillSelectorButtons(selector, record, !isDefault)
    this.prefillActive(record, isDefault)
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

  prefillActive (record, isDefault) {
    if (isDefault) {
      record.classList.add('active')
    }
  },

  activateNonDefaultSelector (container) {
    const ref = StateSelectedElement.getRef()
    const selector = HelperLocalStore.getItem(`current-selector-${ref}`)
    if (!selector) return
    const record = RightSelectorCommon.getRecordBySelector(container, selector)
    RightSelectorCommon.activateSelector(record, container)
  },

  highlightOverides (template, ref, overrides) {
    HelperOverride.highlightOverideClasses(template, overrides?.overrides?.classes)
    HelperOverride.highlightOverideClassesWarning(template, overrides?.overrides?.classes)
    HelperOverride.highlightOverrideSelectors(template, overrides?.selectors)
  }
}
