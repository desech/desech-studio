import ParseCommon from '../ParseCommon.js'
import HelperStyle from '../../../js/helper/HelperStyle.js'

export default {
  getWidth (elementType, element) {
    // styles have no frame data
    if (!element.frame) return null
    const extra = this.getExtraVolume(elementType, element)
    return Math.round(element.frame.width + extra)
  },

  getHeight (elementType, element, addExtra = true) {
    // styles have no frame data
    if (!element.frame) return null
    const extra = addExtra ? this.getExtraVolume(elementType, element) : 0
    return Math.round(element.frame.height + extra)
  },

  getExtraVolume (elementType, element) {
    if (!element.style) return 0
    const stroke = this.getStroke(elementType, element.style.borders)
    return ParseCommon.getExtraVolume(elementType, stroke)
  },

  getStroke (elementType, strokes) {
    if (!this.isStrokeAvailable(elementType, strokes)) return {}
    return {
      type: this.getStrokeType(strokes[0].position),
      size: strokes[0].thickness
    }
  },

  isStrokeAvailable (elementType, strokes) {
    if (elementType === 'text' || !strokes || !strokes.length) {
      return false
    }
    if (strokes.length === 1 && !strokes[0].isEnabled) {
      return false
    }
    return true
  },

  getStrokeType (position) {
    switch (position) {
      case 0:
        return 'center'
      case 1:
        return 'inside'
      case 2:
        return 'outside'
    }
  },

  getCssBasic (type, element) {
    const css = {}
    if (type === 'text' || type === 'inline') return css
    css.width = this.getWidth(type, element) + 'px'
    const height = this.getHeight(type, element)
    css.height = height + 'px'
    ParseCommon.setBlockMinHeight(type, height, css)
    return css
  },

  getCssMixBlendMode (element) {
    if (!element.style.contextSettings || element._class === 'bitmap') {
      return
    }
    const settings = element.style.contextSettings
    return settings.blendMode ? { 'mix-blend-mode': this.getBlendMode(settings) } : null
  },

  getBlendMode (settings) {
    if (!settings || !settings.blendMode) {
      return HelperStyle.getDefaultProperty('background-blend-mode')
    }
    const values = ['normal', 'darken', 'multiply', 'color-burn', 'lighten', 'screen',
      'color-dodge', 'overlay', 'soft-light', 'hard-light', 'difference', 'exclusion', 'hue',
      'saturation', 'color', 'luminosity']
    return values[settings.blendMode]
  },

  getCssRoundedCorners (element) {
    if (element._class === 'oval') return ParseCommon.getCircleRoundedBorders()
    if (!element.points || !element.points[0].cornerRadius) return
    const corners = element.points.map(point => point.cornerRadius)
    return ParseCommon.getRoundedBorders(corners)
  },

  getColor (color) {
    const rgb = [
      Math.round(color.red * 255),
      Math.round(color.green * 255),
      Math.round(color.blue * 255)
    ]
    return ParseCommon.getColor(rgb, color.alpha)
  },

  getFillType (fill) {
    switch (fill.fillType) {
      case 0:
        return 'Solid'
      case 1:
        if (fill.gradient.gradientType === 0) return 'Gradientlinear'
        if (fill.gradient.gradientType === 1) return 'Gradientradial'
        return null // 2 - Angular
      case 4:
        return 'Image'
    }
  },

  getIconFill (fills, addNoFill = true) {
    if (fills && fills.length && fills[0].isEnabled && this.getFillType(fills[0]) === 'Solid') {
      return { fill: this.getColor(fills[0].color) }
    } else if (addNoFill) {
      return { fill: 'transparent' }
    }
  },

  getIconStroke (strokes) {
    if (strokes && strokes.length && strokes[0].isEnabled &&
      this.getFillType(strokes[0]) === 'Solid') {
      return {
        stroke: this.getColor(strokes[0].color),
        'stroke-width': strokes[0].thickness + 'px'
        // @todo stroke-dasharray
      }
    }
  }
}
