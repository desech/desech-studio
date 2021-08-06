import ExtendJS from '../../../js/helper/ExtendJS.js'

export default {
  getRotation (node) {
    // @todo angle value is not calculated correctly - find the correct formula
    // const m = node.relativeTransform // use size.x, size.y for width/height
    // const angle = Math.atan2(-m[1][0], m[0][0])
  },

  getRoundedCorners (node) {
    if (node.rectangleCornerRadii) {
      return node.rectangleCornerRadii
    } else if (node.cornerRadius) {
      const val = node.cornerRadius
      return [val, val, val, val]
    }
  },

  getBlendMode (mode) {
    if (!mode) return
    const value = mode.toLowerCase().replace('_', '-').replace('linear', 'color')
      .replace('pass-through', 'normal')
    if (value !== 'normal') return value
    // PASS_THROUGH, NORMAL => normal
    // DARKEN => darken
    // MULTIPLY => multiply
    // LINEAR_BURN, COLOR_BURN => color-burn
    // LIGHTEN => lighten
    // SCREEN => screen
    // LINEAR_DODGE, COLOR_DODGE => color-dodge
    // OVERLAY => overlay
    // SOFT_LIGHT => soft-light
    // HARD_LIGHT => hard-light
    // DIFFERENCE => difference
    // EXCLUSION => exclusion
    // HUE => hue
    // SATURATION => saturation
    // COLOR => color
    // LUMINOSITY => luminosity
  },

  getOpacity (opacity) {
    if (opacity) return ExtendJS.roundToTwo(opacity)
  },

  getFillStrokeType (type) {
    switch (type) {
      case 'SOLID':
        return 'solid-color'
      case 'IMAGE':
        return 'image'
      case 'GRADIENT_LINEAR':
        return 'linear-gradient'
      default:
        // GRADIENT_RADIAL, GRADIENT_ANGULAR, GRADIENT_DIAMOND
        return 'radial-gradient'
    }
  },

  getColor (obj) {
    return {
      rgb: [
        Math.round(obj.color.r * 255),
        Math.round(obj.color.g * 255),
        Math.round(obj.color.b * 255)
      ],
      alpha: ExtendJS.roundToTwo(this.getColorAlpha(obj))
    }
  },

  getColorAlpha (obj) {
    return (typeof obj.alpha === 'undefined') ? obj.color.a : obj.alpha * obj.color.a
  }
}
