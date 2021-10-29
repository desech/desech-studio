import File from '../File.js'
import ParseCssSplit from './ParseCssSplit.js'

export default {
  _colors: [],

  parseCss (document, folder, options = {}) {
    this._colors = []
    const css = {}
    this.addStyle(document, css, folder, options)
    return Object.values(css)
  },

  addStyle (document, css, folder, options) {
    const files = this.getCssFiles(document, folder)
    for (let i = 0; i < document.styleSheets.length; i++) {
      if (!this.isCssFileAllowed(files[i], options)) continue
      this.addPageBodyRule(files[i], css)
      this.buildRules(document.styleSheets[i], css, folder)
    }
  },

  getCssFiles (document, folder) {
    const files = []
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]')
    for (const cssLink of cssLinks) {
      files.push(cssLink.getAttributeNS(null, 'href'))
    }
    return files
  },

  isCssFileAllowed (file, options) {
    const files = [
      'css/general/reset.css',
      'css/general/animation.css',
      'css/general/font.css',
      'css/general/design-system.css'
    ]
    return (!options.ignoreElementCss || !file.startsWith('css/page/')) && !files.includes(file)
  },

  // we need the empty body sheet to separate between component selectors and page selectors
  addPageBodyRule (file, css) {
    if (file.startsWith('css/page/')) {
      this.addToCss('@media { .e000body { } }', '.e000body', css)
    }
  },

  buildRules (sheet, css, folder) {
    for (const rule of sheet.cssRules) {
      switch (rule.constructor.name) {
        case 'CSSMediaRule':
          this.buildMediaRule(rule, css, folder)
          break
        case 'CSSStyleRule':
          this.buildStyleRule(rule, '', css, folder)
          break
        default:
          // CSSKeyframesRule
          // do nothing
      }
    }
  },

  buildMediaRule (mediaRule, css, folder) {
    for (const styleRule of mediaRule.cssRules) {
      this.buildStyleRule(styleRule, mediaRule.media.mediaText, css, folder)
    }
  },

  buildStyleRule (styleRule, mediaText, css, folder) {
    if (!styleRule.style.length) {
      this.addRule(mediaText, styleRule, 0, css, folder)
    } else {
      for (let i = 0; i < styleRule.style.length; i++) {
        this.addRule(mediaText, styleRule, i, css, folder)
      }
    }
  },

  addRule (media, rule, i, css, folder) {
    const name = rule.style[i] || ''
    const propVal = name ? rule.style.getPropertyValue(name) : ''
    const value = this.parsePropertyValue(propVal, folder)
    if (name.includes('--color-')) this._colors[name] = value
    this.addRuleToCss(media, rule, name, value, css)
  },

  parsePropertyValue (value, folder) {
    value = this.replaceSwatchColor(value)
    value = this.fixFileUrl(value, folder)
    return value
  },

  fixFileUrl (value, folder) {
    if (!value.includes('url(')) return value
    return value.replace(/url\("(.*?)"\)/g, (match, file) => {
      const absFile = File.sanitizePath(File.resolve(folder, file.replace(/\.\.\//g, '')))
      return `url("${absFile}")`
    })
  },

  replaceSwatchColor (value) {
    if (!value.includes('var(')) return value
    return value.replace(/var\((.*?)\)/g, (match, name) => {
      return this._colors[name]
    })
  },

  addRuleToCss (media, rule, name, value, css) {
    const splitRules = ParseCssSplit.splitRules(rule.style, name, value)
    for (const data of splitRules) {
      const item = this.getRuleCss(media, rule, data.name, data.value)
      this.addToCss(item, rule.selectorText, css)
    }
  },

  getRuleCss (media, rule, prop, value) {
    return `@media ${media} { ${rule.selectorText} { ${prop}: ${value}; } }`
  },

  addToCss (rule, selector, css) {
    css[selector] = css[selector] || []
    css[selector].push(rule)
  }
}
