import ExtendJS from '../../../js/helper/ExtendJS.js'

export default {
  getRotation (node) {
    if (node.rotation) return -Math.round(node.rotation)
  },

  getBlendMode (node) {
    const type = node.style.contextSettings?.blendMode
    const values = ['normal', 'darken', 'multiply', 'color-burn', 'lighten', 'screen',
      'color-dodge', 'overlay', 'soft-light', 'hard-light', 'difference', 'exclusion', 'hue',
      'saturation', 'color', 'luminosity']
    if (type) return values[type]
  },

  getOpacity (node) {
    const opacity = node.style.contextSettings?.opacity
    if (opacity) return ExtendJS.roundToTwo(opacity)
  },

  getRoundedCorners (node) {
    if (node.points && node.points[0].cornerRadius) {
      return node.points.map(point => point.cornerRadius)
    }
  },

  getAutoLayout (node) {
    // there's no such thing; you can set a fixed margin, but it's not in the json file
  }
}
