import ImportCommon from '../ImportCommon.js'
import ExtendJS from '../../../js/helper/ExtendJS.js'

export default {
  getRotation (node) {
    if (node.rotation) return -Math.round(node.rotation)
  },

  getBlendMode (style) {
    const type = style?.contextSettings?.blendMode
    const values = ['normal', 'darken', 'multiply', 'color-burn', 'lighten', 'screen',
      'color-dodge', 'overlay', 'soft-light', 'hard-light', 'difference', 'exclusion', 'hue',
      'saturation', 'color', 'luminosity']
    if (type) return values[type]
  },

  getOpacity (style) {
    const opacity = style?.contextSettings?.opacity
    if (opacity) return ExtendJS.roundToTwo(opacity)
  },

  getRoundedCorners (node) {
    if (node.points && node.points[0].cornerRadius) {
      return node.points.map(point => point.cornerRadius)
    }
  },

  getAutoLayout (node) {
    // there's no such thing; you can set a fixed margin, but it's not in the json file
  },

  getColor (obj) {
    const rgb = [
      Math.round(obj.red * 255),
      Math.round(obj.green * 255),
      Math.round(obj.blue * 255)
    ]
    return ImportCommon.getColor(rgb, this.getColorAlpha(obj))
  },

  getColorAlpha (obj) {
    // layerOpacity is the layer opacity, while alpha is the color opacity
    return (typeof obj.layerOpacity === 'undefined') ? obj.alpha : obj.layerOpacity * obj.alpha
  }
}
