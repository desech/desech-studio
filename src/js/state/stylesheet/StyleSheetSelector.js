import StateSelectedElement from '../StateSelectedElement.js'
import HelperElement from '../../helper/HelperElement.js'
import HelperStyle from '../../helper/HelperStyle.js'
import StyleSheetCommon from './StyleSheetCommon.js'
import HelperLocalStore from '../../helper/HelperLocalStore.js'

export default {
  getSelectedElementSelectors () {
    const element = StateSelectedElement.getElement()
    return this.getElementSelectors(element)
  },

  // filter = all, ref, classes
  getElementSelectors (element, filter = 'all') {
    const selectors = []
    const ref = HelperElement.getRef(element)
    const classes = HelperElement.getClasses(element)
    for (const sheet of document.adoptedStyleSheets) {
      const rules = this.getElementSelector(sheet, ref, classes, filter)
      if (rules) selectors.push(rules)
    }
    return selectors
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

  getCurrentSelectorLi (container = document) {
    return container.querySelector('.selector-list-container .selector-element.active')
  },

  getCurrentSelector (container = document) {
    const elem = this.getCurrentSelectorLi(container)
    return elem ? elem.dataset.selector : this.getDefaultSelector()
  },

  getDefaultSelector () {
    const ref = StateSelectedElement.getRef()
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
  unlinkDeletedClassSelector (selector, ref) {
    if (!HelperStyle.isClassSelector(selector)) return
    const cls = HelperStyle.extractClassSelector(selector)
    // do we still have class selectors
    if (this.classSelectorExists(cls)) return
    this.unlinkClass(cls, ref)
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

  linkClass (cls, ref) {
    const element = HelperElement.getElement(ref)
    element.classList.add(cls)
  },

  unlinkClass (cls, ref) {
    const element = HelperElement.getElement(ref)
    element.classList.remove(cls)
  }
}
