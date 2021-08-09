import ExtendJS from '../../js/helper/ExtendJS.js'
import ImportCssFill from './ImportCssFill.js'
import ImportCssEffect from './ImportCssEffect.js'

export default {
  _bodyFont: null,
  _params: null,

  processCss (body, params) {
    this._params = params
    const css = {}
    this._bodyFont = body.style.text.fontFamily
    this.processElementCss(body, css, true)
    return this.prepareCss(css)
  },

  removeBodyFontFromCss (cssList, bodyFont) {
    for (const val of Object.values(cssList)) {
      if (val['font-family'] && val['font-family'] === bodyFont) {
        delete val['font-family']
      }
    }
  },

  processElementCss (element, css, isBody = false) {
    const rules = this.getCssRules(element, css, isBody)
    if (!ExtendJS.isEmpty(rules)) css[element.ref] = rules
    if (element.inlineChildren) this.processElementsCss(element.inlineChildren, css)
    if (element.children) this.processElementsCss(element.children, css)
  },

  processElementsCss (elements, css) {
    for (const element of elements) {
      this.processElementCss(element, css)
    }
  },

  getCssRules (element, css, isBody) {
    const rules = {}
    this.addCssWidthHeight(element, isBody, rules)
    this.addCssRoundedCorners(element, rules)
    this.addCssLayout(element.style.layout, rules)
    this.addCssText(element, css, isBody, rules)
    ImportCssFill.addCssFills(element, rules, this._params)
    this.addCssStroke(element, rules)
    ImportCssEffect.addCssEffects(element, rules)
    return rules
  },

  addCssWidthHeight (element, isBody, rules) {
    if (isBody) return
    if (element.width !== 99999999) rules.width = Math.round(element.width) + 'px'
    if (element.height !== 99999999 && element.designType !== 'line' &&
      element.desechType !== 'text') {
      rules.height = Math.round(element.height) + 'px'
    }
    if (element.desechType === 'block' && element.height < 24) {
      rules['min-height'] = 'auto'
    }
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
    if (layout.gridTemplateColumns) {
      rules['grid-template-columns'] = layout.gridTemplateColumns
    }
    this.addCssLayoutMarginPadding(layout, rules)
    if (layout.justifyContent) rules['justify-content'] = layout.justifyContent
    if (layout.alignContent) rules['align-content'] = layout.alignContent
  },

  addCssLayoutMarginPadding (layout, rules) {
    // @todo work with ImportPosition on padding and justify/align-content
    for (const type of ['margin'/*, 'padding'*/]) {
      if (!layout[type]) continue
      for (const [name, value] of Object.entries(layout[type])) {
        rules[`${type}-${name}`] = Math.round(value) + 'px'
      }
    }
  },

  addCssText (element, css, isBody, rules) {
    this.addCssTextBasic(element.style.text, isBody, rules)
    this.addCssTextExtra(element.style.text, rules)
    this.addCssTextAlign(element, css, rules)
  },

  addCssTextBasic (text, isBody, rules) {
    if (!text) return
    if (text.fontFamily && (isBody || text.fontFamily !== this._bodyFont)) {
      // we don't want the body font on anything other than the body
      rules['font-family'] = text.fontFamily
    }
    if (text.fontSize && text.fontSize !== 16) {
      rules['font-size'] = Math.round(text.fontSize) + 'px'
    }
    if (text.fontWeight && text.fontWeight !== 400) {
      rules['font-weight'] = text.fontWeight
    }
    if (text.fontStyle) rules['font-style'] = text.fontStyle
  },

  addCssTextExtra (text, rules) {
    if (!text) return
    if (text.lineHeight) rules['line-height'] = Math.round(text.lineHeight) + 'px'
    if (text.letterSpacing) rules['letter-spacing'] = Math.round(text.letterSpacing) + 'px'
    if (text.alignSelf) rules['align-self'] = text.alignSelf
    if (text.textTransform) rules['text-transform'] = text.textTransform
    if (text.textDecoration) rules['text-decoration-line'] = text.textDecoration
  },

  addCssTextAlign (element, css, rules) {
    // if we all our children have the same text-alignment, then set it on the parent instead
    if (element.children && element.children.length) {
      this.addCssTextAlignToParent(element, rules)
    }
    // if our parent has a text-alignment, then our children don't need it anymore
    if (element.style?.text?.textAlign &&
      (!css[element.parentRef] || !css[element.parentRef]['text-align'])) {
      rules['text-align'] = element.style.text.textAlign
    }
  },

  addCssTextAlignToParent (element, rules) {
    let value = null
    for (const child of element.children) {
      if (!child.style?.text?.textAlign || (value && value !== child.style.text.textAlign)) {
        return
      }
      value = child.style.text.textAlign
    }
    if (!element.style.text) element.style.text = {}
    element.style.text.textAlign = value
  },

  addCssStroke (element, rules) {
    const stroke = element.style.stroke
    if (!stroke) return
    this.addStrokeSize(element.designType, Math.round(stroke.size), rules)
    this.addStrokeStyle(stroke.style, rules)
    this.addStrokeFill(stroke, rules)
  },

  addStrokeSize (designType, size, rules) {
    if (designType !== 'line') {
      for (const dir of ['image', 'top', 'right', 'bottom', 'left']) {
        rules[`border-${dir}-width`] = size + 'px'
      }
    } else {
      rules['border-image-width'] = size + 'px 0px 0px 0px'
      rules['border-top-width'] = size + 'px'
      rules['border-right-width'] = '0px'
      rules['border-bottom-width'] = '0px'
      rules['border-left-width'] = '0px'
    }
  },

  addStrokeStyle (style, rules) {
    // although border-image doesn't support it, it is required to properly show the border
    for (const dir of ['top', 'right', 'bottom', 'left']) {
      rules[`border-${dir}-style`] = style
    }
  },

  addStrokeFill (stroke, rules) {
    if (stroke.type === 'solid-color') {
      for (const dir of ['top', 'right', 'bottom', 'left']) {
        rules[`border-${dir}-color`] = stroke.color
      }
    } else {
      rules['border-image-source'] = ImportCssFill.getBackgroundImage(stroke, this._params)
      rules['border-image-slice'] = '11%'
    }
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
