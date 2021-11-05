import StateSelectedElement from '../StateSelectedElement.js'
import HelperElement from '../../helper/HelperElement.js'
import HelperStyle from '../../helper/HelperStyle.js'
import StyleSheetCommon from './StyleSheetCommon.js'
import HelperLocalStore from '../../helper/HelperLocalStore.js'
import ExtendJS from '../../helper/ExtendJS.js'
import StateCommandOverride from '../command/StateCommandOverride.js'

export default {
  getDisplayElementSelectors () {
    const element = StateSelectedElement.getElement()
    return this.getElementSelectors(element)
  },

  // filter = all, ref, classes
  getElementSelectors (element, filter = 'all') {
    const selectors = []
    const ref = HelperElement.getStyleRef(element)
    const classes = HelperElement.getClasses(element)
    for (const sheet of document.adoptedStyleSheets) {
      const rules = this.getElementSelector(sheet, ref, classes, filter)
      if (rules) selectors.push(rules)
    }
    this.addOrphanClassesToSelectors(selectors, classes)
    return ExtendJS.unique(selectors)
  },

  getElementSelector (sheet, ref, classes, filter) {
    const selector = sheet.cssRules[0].cssRules[0].selectorText
    const isRef = HelperStyle.selectorHasRef(selector, ref)
    const isClass = HelperStyle.classBelongsToElement(selector, classes)
    if ((filter === 'all' && (isRef || isClass)) || (filter === 'ref' && isRef) ||
      (filter === 'classes' && isClass)) {
      return selector
    }
    return null
  },

  addOrphanClassesToSelectors (selectors, classes) {
    // these come from the design system or a class that was deleted, but it's still attached
    for (const cls of classes) {
      const clsSelector = '.' + cls
      if (this.findClassSelector(selectors, clsSelector)) continue
      selectors.push(clsSelector)
    }
  },

  findClassSelector (selectors, clsSelector) {
    for (const selector of selectors) {
      if (HelperStyle.removeResponsive(selector) === clsSelector) {
        return true
      }
    }
    return false
  },

  getCurrentSelectorLi (container = document) {
    return container.querySelector('.selector-list-container .selector-element.active')
  },

  getCurrentSelector (container = document, useDefault = true) {
    const elem = this.getCurrentSelectorLi(container)
    if (elem) return elem.dataset.selector
    if (useDefault) return this.getDefaultSelector()
  },

  getDefaultSelector () {
    const ref = StateSelectedElement.getStyleRef()
    return HelperStyle.buildRefSelector(ref)
  },

  getCssSelector (ref, selectorLabel) {
    let selector = HelperStyle.buildRefSelector(ref)
    selector += (selectorLabel !== 'default') ? selectorLabel : ''
    return selector
  },

  selectorExists (selector) {
    const sheet = StyleSheetCommon.getSelectorSheet(selector)
    return sheet ? Boolean(sheet.cssRules.length) : false
  },

  deleteSelector (selector) {
    const newSheets = []
    for (const sheet of document.adoptedStyleSheets) {
      if (sheet.cssRules[0].cssRules[0].selectorText !== selector) {
        newSheets.push(sheet)
      }
    }
    document.adoptedStyleSheets = newSheets
  },

  getDeletedSelector (selector) {
    return HelperLocalStore.getItem('selector-' + selector)
  },

  getSelectorClasses () {
    const classes = []
    for (const sheet of document.adoptedStyleSheets) {
      const selector = sheet.cssRules[0].cssRules[0].selectorText
      HelperStyle.addSelectorClass(selector, classes)
    }
    return classes.sort()
  },

  // if all class selectors are deleted, then unlink this class
  async unlinkDeletedClassSelector (selector, ref) {
    if (!HelperStyle.isClassSelector(selector)) return
    const cls = HelperStyle.extractClassSelector(selector)
    // do we still have class selectors
    if (this.classSelectorExists(cls)) return
    await this.unlinkClass(cls, ref)
  },

  classSelectorExists (cls) {
    for (const sheet of document.adoptedStyleSheets) {
      const selector = sheet.cssRules[0].cssRules[0].selectorText
      if (HelperStyle.isClassSelector(selector) &&
        cls === HelperStyle.extractClassSelector(selector)) {
        return true
      }
    }
    return false
  },

  async linkClass (cls, ref) {
    const element = HelperElement.getElement(ref)
    // when we swap components, we lose the original ref and `undo` will not find it
    if (!element) return
    element.classList.add(cls)
    await StateCommandOverride.overrideElement(element, 'classes', { cls, action: 'add' })
  },

  async unlinkClass (cls, ref) {
    const element = HelperElement.getElement(ref)
    // when we swap components, we lose the original ref and `undo` will not find it
    if (!element) return
    element.classList.remove(cls)
    await StateCommandOverride.overrideElement(element, 'classes', { cls, action: 'delete' })
  }
}
