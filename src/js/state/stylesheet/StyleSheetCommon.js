import HelperStyle from '../../helper/HelperStyle.js'
import HelperProject from '../../helper/HelperProject.js'
import HelperCanvas from '../../helper/HelperCanvas.js'

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
      if (HelperStyle.equalsSelector(ruleSelector, selector)) {
        return sheet
      }
    }
  },

  getSelectorSheetIndex (selector) {
    for (let i = 0; i < document.adoptedStyleSheets.length; i++) {
      if (document.adoptedStyleSheets[i].cssRules[0].cssRules[0].selectorText === selector) {
        return i
      }
    }
  },

  addRemoveStyleRules (data, addEmptyValues = false) {
    const sheet = this.getSelectorSheet(data.selector)
    const style = this.prepareStyleData(data.properties, data.responsive || null)
    this.addRemoveRules(sheet, data.selector, style, addEmptyValues)
    this.haveAtLeastOneRule(sheet, data.selector)
  },

  addRemoveRules (sheet, selector, style, addEmptyValues = false) {
    for (const prop of style) {
      this.deleteExistingRule(sheet, prop.name, prop.responsive)
      // empty values are skipped
      if (!addEmptyValues && !prop.value) continue
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
  },

  // returns undefined or empty array as empty values
  getSelectorStyle (selector, matchResponsive = true) {
    const sheet = this.getSelectorSheet(selector)
    if (sheet) return this.extractStyleFromRules(sheet.cssRules, matchResponsive)
  },

  extractStyleFromRules (rules, matchResponsive = true) {
    const style = []
    const responsive = matchResponsive ? HelperCanvas.getCurrentResponsiveWidth() : null
    for (const rule of rules) {
      if (matchResponsive && !this.equalResponsiveRules(rule.cssRules[0], responsive)) {
        continue
      }
      const data = this.getRuleStyle(rule.cssRules[0])
      if (data) style.push(data)
    }
    return style
  },

  getRuleStyle (rule) {
    const responsive = HelperStyle.getSelectorResponsive(rule.selectorText)
    if (!responsive && !rule.style.length) return null
    const name = this.getProperty(rule)
    const value = this.getValue(rule, name)
    if (!name || !value) return
    return { responsive, name, value }
  }
}
