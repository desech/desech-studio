import HelperStyle from '../../helper/HelperStyle.js'
import HelperComponent from '../../helper/HelperComponent.js'
import StyleSheetCommon from './StyleSheetCommon.js'
import StyleSheetSelector from './StyleSheetSelector.js'
import StateStyleSheet from '../StateStyleSheet.js'

export default {
  hasOverrides (ref) {
    for (const sheet of document.adoptedStyleSheets) {
      const rule = sheet.cssRules[0].cssRules[0]
      if (HelperStyle.isSelectorRefComponent(rule.selectorText, ref) && rule.style.length) {
        return true
      }
    }
    return false
  },

  getOverrides (ref) {
    const style = {}
    for (const sheet of document.adoptedStyleSheets) {
      const rule = sheet.cssRules[0].cssRules[0]
      const selector = rule.selectorText
      if (HelperStyle.isSelectorRefComponent(selector, ref) && rule.style.length) {
        style[selector] = StyleSheetCommon.extractStyleFromRules(sheet.cssRules, false)
      }
    }
    return style
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

  convertOverrideToVariant (data, varName, varValue) {
    const styles = this.getOverrides(data.ref)
    if (!styles) return
    StyleSheetSelector.deleteSelectors(Object.keys(styles))
    const cmpSelector = HelperComponent.getComponentClassSelector(data.file, varName, varValue)
    for (const [refSelector, style] of Object.entries(styles)) {
      const selector = refSelector.replace(`.${data.ref}[data-variant]`, cmpSelector)
      StateStyleSheet.addSelector(selector, style)
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
  }
}
