import ParseCommon from '../ParseCommon.js'

export default {
  getX (elementType, element, x, svgPaths) {
    if (elementType === 'icon' && ['path', 'compound'].includes(element.shape?.type)) {
      x = svgPaths[element.id]?.box?.x
    }
    return Math.round(x + (element.transform ? element.transform.tx : 0))
  },

  getY (elementType, element, y, svgPaths) {
    if (elementType === 'icon' && ['path', 'compound'].includes(element.shape?.type)) {
      y = svgPaths[element.id]?.box?.y
    }
    y += (element.transform ? element.transform.ty : 0)
    if (elementType === 'text' && element.text.frame.type !== 'area') {
      y -= this.getHeight(elementType, element, svgPaths)
    }
    return Math.round(y)
  },

  getWidth (elementType, element, svgPaths) {
    // don't add the stroke size to the width when processing lines
    let extra = this.getExtraVolume(elementType, element)
    if (elementType === 'text') {
      return this.getTextWidth(element)
    } else if (element.meta && element.meta.ux.symbolId) {
      return Math.round(element.meta.ux.width + extra)
    } else if (element.shape) {
      if (element.shape.type === 'line') extra = 0
      return Math.round(this.getShapeWidth(element, extra, svgPaths))
    } else if (element['uxdesign#bounds']?.width) {
      return element['uxdesign#bounds'].width
    }
    return 1
  },

  getHeight (elementType, element, svgPaths, addExtra = true) {
    let extra = this.getExtraVolume(elementType, element)
    if (elementType === 'text') {
      return this.getTextHeight(element)
    } else if (element.meta && element.meta.ux.symbolId) {
      return Math.round(element.meta.ux.height + extra)
    } else if (element.shape) {
      if (element.shape.type === 'line') extra = 0
      return Math.round(this.getShapeHeight(element, extra, svgPaths))
    } else if (element['uxdesign#bounds']?.height) {
      return element['uxdesign#bounds'].height
    }
    return 1
  },

  getTextWidth (element) {
    if (element.text.frame.type === 'area') {
      return parseInt(element.text.frame.width)
    } else {
      // @todo wait for adobexd to provide exact values
      // usually a character width is a bit bigger than half the font size,
      // and the W char is, for some fonts, the same as the font size
      // but we don't want to approximate a bigger width because it will clip,
      // so we want a smaller width in order to fit
      return Math.round(element.style.font.size / 2 * element.text.rawText.length)
    }
  },

  getTextHeight (element) {
    if (element.text.frame.type === 'area') {
      return parseInt(element.text.frame.height)
    } else {
      // @todo wait for adobexd to provide exact values
      // the average line height is 1.2, but we have fonts with 0.5 and some with 2.3,
      // but we will use a value of 1 to have the height a bit smaller to not clip
      return Math.round(element.style.font.size * 1)
    }
  },

  getShapeWidth (element, extra, svgPaths) {
    switch (element.shape.type) {
      case 'rect':
        return element.shape.width + extra
      case 'line':
        return element.shape.x2
      case 'ellipse':
        return element.shape.cx + element.shape.rx
      case 'polygon':
        return element.shape['uxdesign#width'] + extra
      default:
        // path, compound
        return svgPaths[element.id]?.box?.width
    }
  },

  getShapeHeight (element, extra, svgPaths) {
    switch (element.shape.type) {
      case 'rect':
        return element.shape.height + extra
      case 'line':
        return element.style.stroke.width
      case 'ellipse':
        return element.shape.cy + element.shape.ry
      case 'polygon':
        return element.shape['uxdesign#height'] + extra
      default:
        // path, compound
        return svgPaths[element.id]?.box?.height
    }
  },

  getExtraVolume (elementType, element) {
    const stroke = this.getStroke(elementType, element)
    return ParseCommon.getExtraVolume(elementType, stroke)
  },

  getStroke (elementType, element) {
    if (!this.isStrokeAvailable(elementType, element.style)) {
      return {}
    }
    return {
      type: (element.shape && element.shape.type === 'line')
        ? 'outside'
        : (element.style.stroke.align || 'center'),
      size: element.style.stroke.width
    }
  },

  isStrokeAvailable (elementType, style) {
    if (elementType === 'icon' || elementType === 'text') {
      return false
    }
    if (!style || !style.stroke || style.stroke.type === 'none') {
      return false
    }
    return true
  },

  getCssBasic (type, element, svgPaths) {
    const css = {}
    if (type === 'text' || type === 'inline') return css
    css.width = this.getWidth(type, element, svgPaths) + 'px'
    const height = this.getHeight(type, element, svgPaths)
    css.height = height + 'px'
    ParseCommon.setBlockMinHeight(type, height, css)
    return css
  },

  getCssMixBlendMode (value) {
    // normal, darken, multiply, color-burn, lighten, screen, color-dodge, overlay, soft-light,
    // hard-light, difference, exclusion, hue, saturation, color, luminosity
    return value ? { 'mix-blend-mode': value } : null
  },

  getCssRoundedCorners (shape) {
    if (shape && shape.type === 'ellipse') {
      return ParseCommon.getCircleRoundedBorders()
    }
    if (!shape || !shape.r) return
    return ParseCommon.getRoundedBorders(shape.r)
  },

  getColor (color) {
    if (!color || !color.value) return
    const rgb = Object.values(color.value)
    return ParseCommon.getColor(rgb, color.alpha || 1)
  }
}
