import HelperStyle from '../helper/HelperStyle.js'
import HelperProject from './HelperProject.js'
import ExtendJS from './ExtendJS.js'

export default {
  hasDesignSystem () {
    return (HelperProject.getProjectSettings().designSystem !== '')
  },

  getDesignSystemClasses () {
    if (!this.hasDesignSystem()) return
    const sheet = this.getDesignSystemSheet()
    if (!sheet) return
    const classes = []
    for (const rule of sheet.cssRules) {
      if (rule.constructor.name !== 'CSSStyleRule') continue
      HelperStyle.addSelectorClass(rule.selectorText, classes)
    }
    return ExtendJS.unique(classes).sort()
  },

  getDesignSystemSheet () {
    const link = document.getElementById('project-css-design-system')
    if (!link) return
    for (const sheet of document.styleSheets) {
      if (sheet.ownerNode === link) return sheet
    }
  },

  getDesignSystemCssFileLink (check = null) {
    const hasDesignSystem = (check !== null) ? check : this.hasDesignSystem()
    if (!hasDesignSystem) return ''
    return '<link rel="stylesheet" href="css/general/design-system.css">\n  '
  },

  getDesignSystemJsFileLink (check = null) {
    const hasDesignSystem = (check !== null) ? check : this.hasDesignSystem()
    if (!hasDesignSystem) return ''
    return '<script src="js/design-system.js"></script>\n  '
  }
}
