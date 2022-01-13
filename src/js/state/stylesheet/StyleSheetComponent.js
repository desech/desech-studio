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

  getOverrides (componentRef, elementRef = null) {
    const style = {}
    for (const sheet of document.adoptedStyleSheets) {
      const rule = sheet.cssRules[0].cssRules[0]
      const selector = rule.selectorText
      if (HelperStyle.selectorStartsWith(selector, '.' + componentRef) && rule.style.length) {
        style[selector] = StyleSheetCommon.extractStyleFromRules(sheet.cssRules, false)
      }
    }
    return this.filterByElement(style, elementRef)
  },

  filterByElement (styles, ref) {
    for (const selector of Object.keys(styles)) {
      if (ref && !selector.includes(ref)) delete styles[selector]
    }
    return styles
  },

  getOverrideSelectors (componentRef, elementRef = null) {
    return Object.keys(this.getOverrides(componentRef, elementRef))
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

  revertStyle (data, varName, varValue, styles) {
    // delete all the existing selectors
    const refSelectors = this.getOverrideSelectors(data.ref)
    StyleSheetSelector.deleteSelectors(refSelectors)
    const componentStyles = this.getVariantOverrides(data.file, varName, varValue)
    StyleSheetSelector.deleteSelectors(Object.keys(componentStyles))
    // add again all our style selectors
    StateStyleSheet.addSelectors(styles)
  },

  renameVariant (data, obj) {
    const regex = this.getRenameVariantRegex(data.file, obj)
    const selectors = this.getRenameVariantSelectors(regex)
    if (!selectors) return
    for (const [oldSelector, newSelector] of Object.entries(selectors)) {
      StyleSheetSelector.renameSelector(oldSelector, newSelector)
    }
  },

  getRenameVariantRegex (file, obj) {
    const cls = HelperComponent.getComponentClass(file)
    if (obj.oldName === obj.name) {
      // only the value changed, while the name stayed the same
      return {
        match: [`\\.${cls}\\[data-variant~="${obj.oldName}=${obj.oldValue}"]`],
        replace: [`.${cls}[data-variant~="${obj.oldName}=${obj.value}"]`]
      }
    } else if (obj.value === obj.oldValue) {
      // only the name changed, while the value stayed the same
      return {
        match: [`\\.${cls}\\[data-variant~="${obj.oldName}=(.*?)"]`],
        replace: [`.${cls}[data-variant~="${obj.name}=$1"]`]
      }
    } else {
      // both the name and the value has changed; order matter
      return {
        match: [
          `\\.${cls}\\[data-variant~="${obj.oldName}=${obj.oldValue}"]`,
          `\\.${cls}\\[data-variant~="${obj.oldName}=(.*?)"]`
        ],
        replace: [
          `.${cls}[data-variant~="${obj.name}=${obj.value}"]`,
          `.${cls}[data-variant~="${obj.name}=$1"]`
        ]
      }
    }
  },

  getRenameVariantSelectors (regex) {
    const selectors = {}
    for (const sheet of document.adoptedStyleSheets) {
      const selector = sheet.cssRules[0].cssRules[0].selectorText
      for (let i = 0; i < regex.match.length; i++) {
        // we can't have duplicates
        const reg = new RegExp(regex.match[i], 'g')
        if (!(selector in selectors) && reg.test(selector)) {
          selectors[selector] = selector.replace(reg, regex.replace[i])
        }
      }
    }
    return selectors
  },

  resetComponentStyles (styles, action) {
    if (action === 'add') {
      StateStyleSheet.addSelectors(styles)
    } else { // remove
      StyleSheetSelector.deleteSelectors(Object.keys(styles))
    }
  }
}
