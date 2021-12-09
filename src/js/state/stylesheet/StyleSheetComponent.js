import HelperStyle from '../../helper/HelperStyle.js'
import HelperComponent from '../../helper/HelperComponent.js'
import StyleSheetCommon from './StyleSheetCommon.js'
import StyleSheetSelector from './StyleSheetSelector.js'
import StateStyleSheet from '../StateStyleSheet.js'

export default {
  hasOverrides (componentRef) {
    for (const sheet of document.adoptedStyleSheets) {
      const rule = sheet.cssRules[0].cssRules[0]
      if (HelperStyle.selectorStartsWith(rule.selectorText, '.' + componentRef) &&
        rule.style.length) {
        return true
      }
    }
    return false
  },

  getOverrides (componentRef) {
    const style = {}
    for (const sheet of document.adoptedStyleSheets) {
      const rule = sheet.cssRules[0].cssRules[0]
      const selector = rule.selectorText
      if (HelperStyle.selectorStartsWith(selector, '.' + componentRef) && rule.style.length) {
        style[selector] = StyleSheetCommon.extractStyleFromRules(sheet.cssRules, false)
      }
    }
    return style
  },

  getOverrideSelectors (componentRef, elementRef = null) {
    const selectors = Object.keys(this.getOverrides(componentRef))
    if (!elementRef) return selectors
    return selectors.filter(selector => selector.includes(elementRef))
  },

  getVariantOverrides (file, varName, varValue) {
    const selectorPart = HelperComponent.getComponentClassSelector(file, varName, varValue)
    return this.getVariantOverridesBySelector(selectorPart)
  },

  getVariantOverridesBySelector (selectorPart) {
    const style = {}
    for (const sheet of document.adoptedStyleSheets) {
      const rule = sheet.cssRules[0].cssRules[0]
      const selector = rule.selectorText
      if (selector.includes(selectorPart) && rule.style.length) {
        style[selector] = StyleSheetCommon.extractStyleFromRules(sheet.cssRules, false)
      }
    }
    return style
  },

  getAllOverrides (data, varName, varValue) {
    const overrideStyle = this.getOverrides(data.ref)
    const variantStyle = this.getVariantOverrides(data.file, varName, varValue)
    return { ...overrideStyle, ...variantStyle }
  },

  convertOverrideToVariant (data, varName, varValue) {
    const styles = this.getOverrides(data.ref)
    if (!styles) return
    StyleSheetSelector.deleteSelectors(Object.keys(styles))
    const cmpSelector = HelperComponent.getComponentClassSelector(data.file, varName, varValue)
    for (const [refSelector, style] of Object.entries(styles)) {
      const selector = refSelector.replace(`.${data.ref}[data-variant]`, cmpSelector)
      // on variant update, the selector can already exist and we need to merge
      StateStyleSheet.addMergeSelector(selector, style)
    }
  },

  convertVariantToOverride (data, varName, varValue) {
    const selectorPart = HelperComponent.getComponentClassSelector(data.file, varName, varValue)
    const componentStyles = this.getVariantOverridesBySelector(selectorPart)
    if (!componentStyles) return
    StyleSheetSelector.deleteSelectors(Object.keys(componentStyles))
    for (const [cmpSelector, style] of Object.entries(componentStyles)) {
      const selector = cmpSelector.replace(selectorPart, `.${data.ref}[data-variant]`)
      StateStyleSheet.addSelector(selector, style)
    }
  },

  resetStyle (data, varName, varValue, styles) {
    const refSelectors = this.getOverrideSelectors(data.ref)
    StyleSheetSelector.deleteSelectors(refSelectors)
    const componentStyles = this.getVariantOverrides(data.file, varName, varValue)
    StyleSheetSelector.deleteSelectors(Object.keys(componentStyles))
    StateStyleSheet.addSelectors(styles)
  },

  renameVariant (data, values) {
    const oldPart = HelperComponent.getComponentClassSelector(data.file, values.oldName,
      values.oldValue)
    const newPart = HelperComponent.getComponentClassSelector(data.file, values.name, values.value)
    const componentStyles = this.getVariantOverridesBySelector(oldPart)
    if (!componentStyles) return
    for (const oldSelector of Object.keys(componentStyles)) {
      const newSelector = oldSelector.replace(oldPart, newPart)
      StyleSheetSelector.renameSelector(oldSelector, newSelector)
    }
  }
}
