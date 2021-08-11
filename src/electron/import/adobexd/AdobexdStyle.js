import ImportCommon from '../ImportCommon.js'
import ExtendJS from '../../../js/helper/ExtendJS.js'

export default {
  getRotation (node) {
    // @todo fix the x coordinate because it's wrongly reported
    // if (node.meta?.ux?.rotation) return node.meta.ux.rotation
  },

  getRoundedCorners (shape) {
    if (shape?.r) return shape.r
  },

  getAutoLayout (node) {
    // @todo autolayout is not supported because it applies to groups and they have no x,y,w,h
    // for the same reason we ignore repeat grids and scroll groups
  },

  getOpacity (node) {
    if (node.style?.opacity) {
      return ExtendJS.roundToTwo(node.style.opacity)
    }
  },

  getBlendMode (node) {
    // normal, darken, multiply, color-burn, lighten, screen, color-dodge, overlay, soft-light,
    // hard-light, difference, exclusion, hue, saturation, color, luminosity
    return node.style?.blendMode
  },

  getColor (color) {
    if (!color || !color.value) return
    const rgb = Object.values(color.value)
    return ImportCommon.getColor(rgb, color.alpha || 1)
  }
}
