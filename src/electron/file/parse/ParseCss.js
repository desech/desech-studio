import fs from 'fs'
import File from '../File.js'
import HelperFile from '../../../js/helper/HelperFile.js'
import HelperStyle from '../../../js/helper/HelperStyle.js'
import HelperRegex from '../../../js/helper/HelperRegex.js'
import ParseCssSplit from './ParseCssSplit.js'

export default {
  _colors: [],

  parseCss (document, folder, parseElementCss = true) {
    this._colors = []
    const css = {}
    this.addStyle(document, css, folder, parseElementCss)
    this.cleanProjectCss(css, folder)
    return Object.values(css)
  },

  addStyle (document, css, folder, parseElementCss) {
    const files = this.getCssFiles(document, folder)
    for (let i = 0; i < document.styleSheets.length; i++) {
      if (!this.isCssFileAllowed(files[i], parseElementCss)) continue
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

  isCssFileAllowed (file, parseElementCss) {
    const files = [
      'css/general/reset.css',
      'css/general/animation.css',
      'css/general/font.css',
      'css/general/design-system.css'
    ]
    return (parseElementCss || !file.startsWith('css/page/')) && !files.includes(file)
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
  },

  cleanProjectCss (css, folder) {
    const files = File.readFolder(folder, {
      sort: false,
      ignoreFiles: HelperFile.getIgnoredFileFolders()
    })
    const htmlFiles = this.getHtmlFiles(files)
    const classes = this.getHtmlClasses(htmlFiles)
    this.removeClassesNotFoundInHtmlFiles(css, classes)
  },

  getHtmlFiles (files, html = []) {
    for (const file of files) {
      if (file.extension === 'html') html.push(file.path)
      if (file.children.length) this.getHtmlFiles(file.children, html)
    }
    return html
  },

  getHtmlClasses (files) {
    const classes = []
    for (const file of files) {
      const html = fs.readFileSync(file).toString()
      if (html) this.addHtmlClasses(html, classes)
    }
    return classes
  },

  addHtmlClasses (html, classes) {
    const regex = HelperRegex.getMatchingGroups(html, /class="(?<cls>.*?)"/gi)
    for (const val of regex) {
      for (let cls of val.cls.split(' ')) {
        cls = cls.trim()
        if (cls && !['text', 'block'].includes(cls)) classes.push(cls)
      }
    }
  },

  removeClassesNotFoundInHtmlFiles (css, classes) {
    for (const selector of Object.keys(css)) {
      if (selector === ':root') continue
      const cls = HelperStyle.getClassFromSelector(selector).replace('_ss_', '')
      if (!classes.includes(cls)) delete css[selector]
    }
  }
}
