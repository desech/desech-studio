import HelperProject from './HelperProject.js'

export default {
  hasDesignSystem () {
    return (HelperProject.getProjectSettings().designSystem !== '')
  },

  getDesignSystemCssFileLink (check = null) {
    const hasDesignSystem = (check !== null) ? check : this.hasDesignSystem()
    if (!hasDesignSystem) return ''
    return '<link rel="stylesheet" href="css/general/design-system.css">\n  '
  }
}
