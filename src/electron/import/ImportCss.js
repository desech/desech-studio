import ExtendJS from '../../js/helper/ExtendJS.js'

export default {
  processCss (body) {
    const css = {}
    this.processElementCss(body, css, true)
    return this.prepareCss(css)
  },

  processElementCss (element, css, isBody = false) {
    const rules = this.getCssRules(element, isBody)
    if (!ExtendJS.isEmpty(rules)) css[element.ref] = rules
    if (element.inlineChildren) this.processElementsCss(element.inlineChildren, css)
    if (element.children) this.processElementsCss(element.children, css)
  },

  processElementsCss (elements, css) {
    for (const element of elements) {
      this.processElementCss(element, css)
    }
  },

  getCssRules (element, isBody) {
    const rules = {}
    this.addCssWidthHeight(element, isBody, rules)
    this.addCssRoundedCorners(element, rules)
    this.addCssLayout(element.style.layout, rules)
    this.addCssText(element.style.text, rules)
    return rules
  },

  addCssWidthHeight (element, isBody, rules) {
    if (isBody) return
    rules.width = Math.round(element.width) + 'px'
    rules.height = Math.round(element.height) + 'px'
  },

  addCssRoundedCorners (element, rules) {
    if (element.designType === 'ellipse') {
      rules['border-top-left-radius'] = '50%'
      rules['border-top-right-radius'] = '50%'
      rules['border-bottom-right-radius'] = '50%'
      rules['border-bottom-left-radius'] = '50%'
    } else if (element.style.corners) {
      rules['border-top-left-radius'] = Math.round(element.style.corners[0]) + 'px'
      rules['border-top-right-radius'] = Math.round(element.style.corners[1]) + 'px'
      rules['border-bottom-right-radius'] = Math.round(element.style.corners[2]) + 'px'
      rules['border-bottom-left-radius'] = Math.round(element.style.corners[3]) + 'px'
    }
  },

  addCssLayout (layout, rules) {
    // direction, gap, padding, margin, justifyContent, alignContent
    if (!layout) return
    if (typeof layout.gap !== 'undefined' && layout.gap !== 10) {
      rules[`${layout.direction}-gap`] = Math.round(layout.gap) + 'px'
    }
    for (const type of ['margin', 'padding']) {
      if (!layout[type]) continue
      for (const [name, value] of Object.entries(layout[type])) {
        rules[`${type}-${name}`] = Math.round(value) + 'px'
      }
    }
    if (layout.justifyContent) rules['justify-content'] = layout.justifyContent
    if (layout.alignContent) rules['align-content'] = layout.alignContent
  },

  addCssText (text, rules) {
    if (!text) return
  },

  prepareCss (css) {
    const data = []
    for (const [ref, rules] of Object.entries(css)) {
      data.push(this.prepareCssRecord(ref, rules))
    }
    return data
  },

  prepareCssRecord (ref, rules) {
    const record = []
    for (const [property, value] of Object.entries(rules)) {
      record.push({ selector: '.' + ref, property, value })
    }
    return record
  }
}
