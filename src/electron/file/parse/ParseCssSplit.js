import HelperStyle from '../../../js/helper/HelperStyle.js'
import ParseCommon from './ParseCommon.js'
import HelperRegex from '../../../js/helper/HelperRegex.js'

export default {
  splitRules (style, name, value) {
    switch (name) {
      case 'margin':
      case 'padding':
        return this.splitMarginPadding(name, value)
      case 'border-radius':
        return this.splitBorderRadius(value)
      case 'border-style':
        return this.splitBorderStyle(value)
      case 'border-width':
        return this.splitBorderWidth(value)
      case 'border-color':
        return this.splitBorderColor(value)
      case 'border':
        return this.splitBorder(value)
      case 'background-image':
        return this.splitBackgroundImage(style, name, value)
      default:
        return [{ name, value }]
    }
  },

  splitEqualProperties (names, value) {
    const rules = []
    for (const name of names) {
      rules.push({ name, value })
    }
    return rules
  },

  splitMarginPadding (type, propVal) {
    const sides = HelperStyle.split4SidesValue(propVal)
    const rules = []
    for (const [dir, value] of Object.entries(sides)) {
      rules.push({ name: `${type}-${dir}`, value })
    }
    return rules
  },

  splitBorderRadius (value) {
    const names = ParseCommon.getBorderRadiusProperties()
    return this.splitEqualProperties(names, value)
  },

  splitBorderStyle (value) {
    const names = ParseCommon.getBorderStyleProperties()
    return this.splitEqualProperties(names, value)
  },

  splitBorderWidth (value) {
    const names = ParseCommon.getBorderWidthProperties()
    return this.splitEqualProperties(names, value)
  },

  splitBorderColor (value) {
    const names = ParseCommon.getBorderColorProperties()
    return this.splitEqualProperties(names, value)
  },

  splitBorder (value) {
    const chunks = HelperRegex.splitByCharacter(value, ' ')
    return [
      ...this.splitBorderWidth(chunks[0]),
      ...this.splitBorderStyle(chunks[1]),
      ...this.splitBorderColor(chunks[2])
    ]
  },

  splitBackgroundImage (style, name, value) {
    const rules = [{ name, value }]
    for (const prop of ParseCommon.getBackgroundProperties()) {
      if (!style[prop]) {
        // re-add the default background props
        rules.push({ name: prop, value: HelperStyle.getDefaultProperty(prop) })
      }
    }
    return rules
  }
}
