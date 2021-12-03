import StateSelectedElement from '../StateSelectedElement.js'
import HelperElement from '../../helper/HelperElement.js'
import HelperStyle from '../../helper/HelperStyle.js'
import StyleSheetCommon from './StyleSheetCommon.js'
import HelperLocalStore from '../../helper/HelperLocalStore.js'
import ExtendJS from '../../helper/ExtendJS.js'
import StateCommandOverride from '../command/StateCommandOverride.js'
import HelperComponent from '../../helper/HelperComponent.js'
import HelperOverride from '../../helper/HelperOverride.js'

export default {
  getDisplayElementSelectors () {
    const element = StateSelectedElement.getElement()
    return this.getElementSelectors(element)
  },

  // filter = all, ref, classes
  getElementSelectors (element, filter = 'all', ref = null) {
    const selectors = []
    if (!ref) ref = HelperElement.getStyleRef(element)
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

  getCurrentSelector () {
    const record = document.querySelector('.selector-list-container .selector-element.active')
    return record ? record.dataset.selector : this.getDefaultSelector()
  },

  getDefaultSelector () {
    const element = StateSelectedElement.getElement()
    if (HelperComponent.belongsToAComponent(element)) {
      return this.getComponentRefSelector(element)
    } else {
      const ref = HelperElement.getStyleRef(element)
      return HelperStyle.buildRefSelector(ref)
    }
  },

  getComponentRefSelector (element) {
    const parent = this.buildComponentRefParentsSelector(element)
    const ref = HelperElement.getStyleRef(element)
    const selector = HelperStyle.buildRefSelector(ref)
    return HelperComponent.isComponent(element) ? parent + selector : parent + ' ' + selector
  },

  buildComponentRefParentsSelector (element) {
    const parents = HelperOverride.getElementParents(element)
    const parts = []
    for (const parent of parents) {
      parts.push(`.${parent.data.ref}[data-variant]`)
    }
    return parts.join(' ')
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
