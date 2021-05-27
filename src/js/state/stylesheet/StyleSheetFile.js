import StyleSheetCommon from './StyleSheetCommon.js'
import HelperFile from '../../helper/HelperFile.js'
import HelperStyle from '../../helper/HelperStyle.js'
import HelperElement from '../../helper/HelperElement.js'
import HelperProject from '../../helper/HelperProject.js'
import CanvasCommon from '../../main/canvas/CanvasCommon.js'

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
    for (const sheet of document.adoptedStyleSheets) {
      for (const rule of sheet.cssRules) {
        this.addStyleRule(rule, css)
      }
    }
    return this.formatReturn(css)
  },

  initStyleCss () {
    return {
      color: {},
      componentCss: {},
      componentHtml: {},
      element: {}
    }
  },

  addStyleRule (rule, css) {
    const selector = rule.cssRules[0].selectorText
    const index = selector + rule.conditionText
    const type = this.getSelectorType(selector)
    switch (type) {
      case 'root':
        this.addStyleItem(css.color, ':root', rule, css)
        break
      case 'componentCss':
        this.addStyleItem(css.componentCss, index, rule, css)
        break
      case 'componentHtml':
        this.addStyleItem(css.componentHtml, index, rule, css)
        break
      case 'element':
        this.addStyleItem(css.element, index, rule, css)
        break
      default:
        // ignore
    }
  },

  getSelectorType (selector) {
    if (selector === ':root') return 'root'
    if (selector.includes('._ss_')) return 'componentCss'
    if (HelperProject.isFileComponent()) return 'componentHtml'
    const ref = HelperStyle.extractRefFromSelector(selector)
    let element = HelperElement.getElement(ref)
    if (!element) return
    element = CanvasCommon.getClosestElementOrComponent(element)
    return (element.classList.contains('component')) ? 'componentHtml' : 'element'
  },

  addStyleItem (sheet, index, rule, css) {
    if (!sheet[index]) sheet[index] = []
    this.addToStyle(sheet[index], this.getStyleData(rule), css)
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

  addToStyle (sheet, data, css) {
    // ignore empty elements
    if (!data.value) return
    if (data.value.includes('url(')) data.value = this.fixFileUrl(data.value)
    sheet.push(data)
    this.addPrefixRules(sheet, data)
  },

  fixFileUrl (value) {
    return value.replace(/url\("(.*?)"\)/g, (match, file) => {
      return `url("../${HelperFile.getRelPath(file)}")`
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
      'font-kerning': ['-webkit-font-kerning'], // ios safari
      hyphens: ['-webkit-hyphens'], // safari
      'line-break': ['-webkit-line-break'], // safari
      'text-combine-upright': ['-webkit-text-combine'], // safari
      'text-orientation': ['-webkit-text-orientation'], // safari
      'shape-margin': ['-webkit-shape-margin'], // desktop safari
      '-webkit-mask-image': ['mask-image'], // safari, chrome
      appearance: ['-webkit-appearance'], // safari
      'user-select': ['-webkit-user-select'], // safari
      'tab-size': ['-moz-tab-size'] // firefox
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
