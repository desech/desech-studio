import HelperStyle from '../helper/HelperStyle.js'

export default {
  injectDesignSystemCss (css) {
    const sheet = document.createElement('style')
    sheet.innerHTML = css
    document.getElementById('page-main').appendChild(sheet)
  },

  hasDesignSystem () {
    return document.styleSheets[2] // 0 = style, 1 = fonts, 2 = design system
  },

  getDesignSystemClasses () {
    if (!this.hasDesignSystem()) return
    const classes = []
    for (const rule of document.styleSheets[2].cssRules) {
      if (rule.constructor.name !== 'CSSStyleRule') continue
      HelperStyle.addSelectorClass(rule.selectorText, classes)
    }
    return classes.sort()
  },

  getDesignSystemCssFileLink (check = null) {
    const hasDesignSystem = (check !== null) ? check : this.hasDesignSystem()
    if (!hasDesignSystem) return ''
    return '\n  <link rel="stylesheet" href="css/general/design-system.css">'
  },

  getDesignSystemJsFileLink (check = null) {
    const hasDesignSystem = (check !== null) ? check : this.hasDesignSystem()
    if (!hasDesignSystem) return ''
    return '\n  <script src="js/design-system.js"></script>'
  }
}
