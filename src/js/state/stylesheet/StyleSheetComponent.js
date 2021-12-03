import HelperElement from '../../helper/HelperElement.js'
import HelperStyle from '../../helper/HelperStyle.js'
import HelperComponent from '../../helper/HelperComponent.js'
import HelperOverride from '../../helper/HelperOverride.js'

export default {
  getRefSelector (element) {
    const parent = this.getRefParentsSelector(element)
    const ref = HelperElement.getStyleRef(element)
    const selector = HelperStyle.buildRefSelector(ref)
    return HelperComponent.isComponent(element) ? parent + selector : parent + ' ' + selector
  },

  getRefParentsSelector (element) {
    const parents = HelperOverride.getElementParents(element)
    const parts = []
    for (const parent of parents) {
      parts.push(`.${parent.data.ref}[data-variant]`)
    }
    return parts.join(' ')
  },

  hasOverrides (ref) {
    for (const sheet of document.adoptedStyleSheets) {
      const rule = sheet.cssRules[0].cssRules[0]
      if (HelperStyle.selectorHasRef(rule.selectorText, ref) && rule.style.length) {
        return true
      }
    }
    return false
  },

  convertOverrideToVariant (ref, variantName, variantValue) {
    
  }
}
