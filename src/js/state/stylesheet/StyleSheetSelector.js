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
    const selectors = this.getElementSelectors(element)
    return selectors.map(selector => HelperStyle.removeResponsive(selector))
  },

  // filter = class, variant, ref
  getElementSelectors (element, filter = null) {
    const selectors = []
    const classes = HelperElement.getClasses(element.classList)
    const refSelectors = this.getRefSelectors(element)
    for (const sheet of document.adoptedStyleSheets) {
      const selector = this.getElementSelector(sheet, classes, refSelectors, filter)
      if (selector) selectors.push(selector)
    }
    if (!filter || filter === 'class') {
      this.addOrphanClassesToSelectors(selectors, classes)
    }
    return ExtendJS.unique(selectors)
  },

  getElementSelector (sheet, classes, refSelectors, filter) {
    const selector = sheet.cssRules[0].cssRules[0].selectorText
    const isClass = HelperStyle.classBelongsToElement(selector, classes)
    const isVariant = this.isVariantSelector(selector, refSelectors.variants)
    const isRef = HelperStyle.selectorStartsWith(selector, refSelectors.ref)
    if ((!filter && (isClass || isVariant || isRef)) || (filter === 'class' && isClass) ||
      (filter === 'variant' && isVariant) || (filter === 'ref' && isRef)) {
      return selector
    }
    return null
  },

  isVariantSelector (selector, variantSelectors) {
    if (!variantSelectors) return false
    for (const variantSelector of variantSelectors) {
      if (HelperStyle.selectorStartsWith(selector, variantSelector)) {
        return true
      }
    }
    return false
  },

  addOrphanClassesToSelectors (selectors, classes) {
    // these come from classes that were deleted, but still attached
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
    return this.getRefSelector(element)
  },

  getRefSelector (element) {
    return this.getRefSelectors(element).ref
  },

  getRefSelectors (element) {
    if (HelperComponent.belongsToAComponent(element, true)) {
      return this.getComponentSelectors(element)
    } else {
      const ref = HelperElement.getStyleRef(element)
      return { ref: HelperStyle.buildRefSelector(ref) }
    }
  },

  getComponentSelectors (element) {
    const parents = HelperOverride.getElementParents(element)
    const ref = HelperElement.getStyleRef(element)
    const isComponent = HelperComponent.isComponent(element)
    const refSelector = this.getComponentRefSelector(parents, ref, isComponent)
    const variants = this.getComponentVariantSelectors(parents, ref, isComponent)
    return { ref: refSelector, variants }
  },

  getComponentRefSelector (parents, ref, isComponent) {
    let selector = this.getComponentParentsSelector(parents)
    selector += this.getRefSelectorPart(ref, isComponent)
    return selector
  },

  getComponentParentsSelector (parents) {
    const parts = []
    for (const parent of parents) {
      parts.push(`.${parent.data.ref}[data-variant]`)
    }
    return parts.join(' ')
  },

  getComponentVariantSelectors (parents, ref, isComponent) {
    if (!parents[0].data.variants) return
    const selectors = []
    const subPart = this.getComponentParentsSelector(parents.slice(1))
    for (const [name, value] of Object.entries(parents[0].data.variants)) {
      const selector = this.getComponentVariantSelector(ref, isComponent, parents[0].data.file,
        name, value, subPart)
      selectors.push(selector)
    }
    return selectors
  },

  getComponentVariantSelector (ref, isComponent, file, varName, varValue, subPart) {
    let selector = HelperComponent.getComponentClassSelector(file, varName, varValue)
    if (subPart) selector += ' ' + subPart
    selector += this.getRefSelectorPart(ref, isComponent)
    return selector
  },

  getRefSelectorPart (ref, isComponent) {
    const selector = HelperStyle.buildRefSelector(ref)
    return isComponent ? selector : ' ' + selector
  },

  selectorExists (selector) {
    const sheet = StyleSheetCommon.getSelectorSheet(selector)
    return sheet ? Boolean(sheet.cssRules.length) : false
  },

  emptySelector (selector) {
    const sheet = StyleSheetCommon.getSelectorSheet(selector)
    for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
      StyleSheetCommon.deleteRule(sheet, i)
    }
    const emptyRule = HelperStyle.buildRule(selector)
    StyleSheetCommon.addRule(sheet, emptyRule)
    return sheet
  },

  deleteSelector (selector) {
    this.deleteSelectors([selector])
  },

  deleteSelectors (selectors) {
    const newSheets = []
    for (const sheet of document.adoptedStyleSheets) {
      const selector = HelperStyle.removeResponsive(sheet.cssRules[0].cssRules[0].selectorText)
      if (!selectors.includes(selector)) {
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
    return ExtendJS.unique(classes).sort()
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
    await StateCommandOverride.overrideElement(element, 'classes', [{ cls, action: 'add' }])
  },

  async unlinkClass (cls, ref) {
    const element = HelperElement.getElement(ref)
    // when we swap components, we lose the original ref and `undo` will not find it
    if (!element) return
    element.classList.remove(cls)
    await StateCommandOverride.overrideElement(element, 'classes', [{ cls, action: 'delete' }])
  },

  renameSelector (oldSelector, newSelector) {
    const sheet = StyleSheetCommon.getSelectorSheet(oldSelector)
    for (const rules of sheet.cssRules) {
      rules.cssRules[0].selectorText = newSelector
    }
  }
}
