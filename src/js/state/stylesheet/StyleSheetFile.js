import StyleSheetCommon from './StyleSheetCommon.js'
import HelperFile from '../../helper/HelperFile.js'
import HelperStyle from '../../helper/HelperStyle.js'

export default {
  reloadStyle (css) {
    this.clearStyle()
    this.loadStyle(css)
  },

  clearStyle () {
    document.adoptedStyleSheets = []
  },

  loadStyle (css) {
    this.addRootStyleIfMissing(css)
    document.adoptedStyleSheets = this.loadStyleSheets(css)
  },

  addRootStyleIfMissing (css) {
    if (css.length && css[0][0].indexOf(':root') > 0) return
    css.unshift(['@media { :root { } }'])
  },

  loadStyleSheets (css, sheets = []) {
    for (let i = 0; i < css.length; i++) {
      sheets.push(StyleSheetCommon.initStyleSheet())
      for (let rule of css[i]) {
        rule = this.convertResponsiveClass(rule)
        StyleSheetCommon.addRule(sheets[i], rule, sheets[i].cssRules.length)
      }
    }
    return sheets
  },

  convertResponsiveClass (rule) {
    if (!rule.startsWith('@media (')) return rule
    return rule.replace(/@media \(.*-width: (.*?)\) \{/, (match, value) => {
      // @media (min-width: 1200px) {
      return `@media { .responsive-${value}`
    })
  },

  getStyle () {
    const css = this.initStyleCss()
    let foundBody = false
    for (const sheet of document.adoptedStyleSheets) {
      const cls = this.getClass(sheet)
      let addSuccess = false
      for (const rule of sheet.cssRules) {
        const selector = rule.cssRules[0].selectorText
        if (selector === '.e000body') foundBody = true
        const type = this.getSelectorType(selector, foundBody)
        const success = this.addStyleRule(rule, selector, type, css)
        if (success) addSuccess = true
      }
      this.addEmptyClass(cls, addSuccess, css)
    }
    return this.formatReturn(css)
  },

  getClass (sheet) {
    const selector = sheet.cssRules[0].cssRules[0].selectorText
    const isClass = HelperStyle.isClassSelector(selector)
    return isClass ? HelperStyle.extractClassSelector(selector) : null
  },

  // we need to add classes as empty if no sheets have succeeded because of empty values
  addEmptyClass (cls, success, css) {
    if (!cls || success) return
    const selector = '.' + cls
    css.componentCss[selector] = [{
      responsive: '',
      selector: HelperStyle.sanitizeSelector(selector),
      property: '',
      value: ''
    }]
  },

  initStyleCss () {
    return {
      color: {},
      componentCss: {},
      componentHtml: {},
      element: {}
    }
  },

  getSelectorType (selector, foundBody) {
    if (selector === ':root') {
      return 'root'
    } else if (selector.includes('._ss_')) {
      return 'componentCss'
    } else if (HelperFile.isComponentFile() || !foundBody) {
      return 'componentHtml'
    } else if (foundBody) {
      return 'element'
    }
  },

  addStyleRule (rule, selector, type, css) {
    switch (type) {
      case 'root':
        return this.addStyleItem(css.color, ':root', rule)
      case 'componentCss':
        return this.addStyleItem(css.componentCss, selector, rule)
      case 'componentHtml':
        return this.addStyleItem(css.componentHtml, selector, rule)
      case 'element':
        return this.addStyleItem(css.element, selector, rule)
    }
  },

  addStyleItem (sheet, selector, rule) {
    if (!sheet[selector]) sheet[selector] = []
    return this.addToStyle(sheet[selector], this.getStyleData(rule))
  },

  getStyleData (mediaRule) {
    const rule = mediaRule.cssRules[0]
    const selector = rule.selectorText
    const property = StyleSheetCommon.getProperty(rule)
    return {
      responsive: this.getMediaQuery(selector),
      selector: HelperStyle.sanitizeSelector(selector),
      property,
      value: StyleSheetCommon.getValue(rule, property)
    }
  },

  getMediaQuery (selector) {
    const data = HelperStyle.getSelectorResponsive(selector)
    if (data['min-width']) return `(min-width: ${data['min-width']})`
    if (data['max-width']) return `(max-width: ${data['max-width']})`
    return ''
  },

  addToStyle (sheet, data) {
    // ignore empty properties
    if (!data.value) return
    if (data.value.includes('url(')) {
      data.value = this.fixFileUrl(data.value)
    }
    sheet.push(data)
    this.addPrefixRules(sheet, data)
    return true
  },

  fixFileUrl (value) {
    return value.replace(/url\("(.*?)"\)/g, (match, file) => {
      return `url("../../${HelperFile.getRelPath(file)}")`
    })
  },

  addPrefixRules (sheet, data) {
    const properties = this.getUnsupportedProperties()[data.property] || []
    for (const prop of properties) {
      sheet.push({
        ...data,
        property: prop
      })
    }
  },

  getUnsupportedProperties () {
    return {
      'background-clip': ['-webkit-background-clip'], // safari, chrome; for `text` only
      hyphens: ['-webkit-hyphens'], // safari
      'text-combine-upright': ['-webkit-text-combine'], // safari
      '-webkit-mask-image': ['mask-image'], // safari, chrome
      'user-select': ['-webkit-user-select'] // safari
    }
  },

  formatReturn (data) {
    return {
      color: this.formatStyle(data.color),
      componentCss: this.formatStyle(data.componentCss),
      componentHtml: this.formatStyle(data.componentHtml),
      element: this.formatStyle(data.element)
    }
  },

  formatStyle (data) {
    const array = Object.values(data)
    return array.length ? this.sortStyle(array) : []
  },

  sortStyle (data) {
    for (let style of data) {
      style = style.sort((a, b) => {
        return a.property < b.property ? -1 : (a.property > b.property ? 1 : 0)
      })
    }
    return data
  }
}
