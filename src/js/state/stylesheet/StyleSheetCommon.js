import HelperStyle from '../../helper/HelperStyle.js'
import HelperProject from '../../helper/HelperProject.js'

export default {
  getProperty (rule) {
    // return rule.style[0] // for background-repeat returns background-repeat-x and y
    const match = rule.cssText.match(/{ (.*?):/)
    return (match && match[1]) ? match[1] : ''
  },

  getValue (rule, property) {
    return property ? (rule.style.getPropertyValue(property).trim() || '') : ''
  },

  getSelectorSheet (selector) {
    for (const sheet of document.adoptedStyleSheets) {
      const ruleSelector = sheet.cssRules[0].cssRules[0].selectorText
      // the selector can have the responsive class in front
      if (ruleSelector.endsWith(selector)) return sheet
    }
  },

  getSelectorSheetIndex (selector) {
    for (let i = 0; i < document.adoptedStyleSheets.length; i++) {
      if (document.adoptedStyleSheets[i].cssRules[0].cssRules[0].selectorText === selector) {
        return i
      }
    }
  },

  addRemoveRules (sheet, selector, style, ignoreAddEmpty = false) {
    for (const prop of style) {
      this.deleteExistingRule(sheet, prop.name, prop.responsive)
      // empty values are skipped
      if (ignoreAddEmpty && !prop.value) continue
      const rule = HelperStyle.buildRule(selector, prop.name, prop.value, prop.responsive)
      const index = this.getRulePosition(sheet, selector, prop.responsive)
      this.addRule(sheet, rule, index)
    }
  },

  getRulePosition (sheet, selector, responsive) {
    if (!responsive) return 0
    const responsiveType = HelperProject.getProjectSettings().responsiveType
    const responsiveWidth = parseInt(responsive['min-width'] || responsive['max-width'])
    for (let i = 0; i < sheet.cssRules.length; i++) {
      const current = sheet.cssRules[i] ? sheet.cssRules[i].cssRules[0].selectorText : null
      if (!current || !current.startsWith('.responsive-')) continue
      const currentWidth = parseInt(current.replace('.responsive-', ''))
      if ((responsiveType === 'desktop' && responsiveWidth >= currentWidth) ||
        (responsiveType === 'mobile' && responsiveWidth <= currentWidth)) {
        return i
      }
    }
    return sheet.cssRules.length
  },

  deleteExistingRule (sheet, property, responsive) {
    if (!sheet.cssRules || !sheet.cssRules.length) return
    for (let i = 0; i < sheet.cssRules.length; i++) {
      const rule = sheet.cssRules[i] ? sheet.cssRules[i].cssRules[0] : null
      if (rule && this.equalResponsiveRules(rule, responsive) && rule.style[property]) {
        this.deleteRule(sheet, i)
        return
      }
    }
  },

  equalResponsiveRules (rule, data) {
    const selector = HelperStyle.buildResponsiveClass(data)
    return ((selector && rule.selectorText.startsWith(selector)) ||
      (!selector && !rule.selectorText.startsWith('.responsive-')))
  },

  deleteRule (sheet, index) {
    sheet.deleteRule(index)
  },

  addRule (sheet, rule, index = 0) {
    sheet.insertRule(rule, index)
  },

  addRemoveStyleRules (data, ignoreAddEmpty = false) {
    const sheet = this.getSelectorSheet(data.selector)
    const style = this.prepareStyleData(data.properties, data.responsive || null)
    this.addRemoveRules(sheet, data.selector, style, ignoreAddEmpty)
    this.haveAtLeastOneRule(sheet, data.selector)
  },

  prepareStyleData (properties, responsive = null) {
    const style = []
    for (const [name, value] of Object.entries(properties)) {
      style.push({ responsive, name, value })
    }
    return style
  },

  haveAtLeastOneRule (sheet, selector) {
    if (!sheet.cssRules.length) {
      const rule = HelperStyle.buildRule(selector)
      this.addRule(sheet, rule)
    }
  },

  initStyleSheet () {
    return new CSSStyleSheet()
  }
}
