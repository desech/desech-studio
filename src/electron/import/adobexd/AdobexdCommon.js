import ParseCommon from '../ParseCommon.js'

export default {
  getX (parentX, desechType, element, svgData) {
    let x = 0
    if (desechType === 'icon' && svgData[element.id]) {
      x = svgData[element.id]?.box?.x
    }
    if (element.transform?.tx) x += Math.round(element.transform.tx)
    return Math.round(x + parentX)
  },

  getY (parentY, desechType, element, svgData) {
    let y = 0
    if (desechType === 'icon' && svgData[element.id]) {
      y = svgData[element.id]?.box?.y
    }
    if (element.transform?.ty) y += Math.round(element.transform.ty)
    if (desechType === 'text' && element.text.frame.type !== 'area') {
      y -= this.getHeight(desechType, element, svgData)
    }
    if (element.shape?.type === 'line') {
      y -= Math.round(element.style.stroke.width / 2)
    }
    return Math.round(y + parentY)
  },

  getWidth (desechType, element, svgData) {
    // don't add the stroke size to the width when processing lines
    let extra = this.getExtraVolume(desechType, element)
    if (desechType === 'text') {
      return this.getTextWidth(element)
    } else if (desechType === 'icon' || element.shape) {
      if (element.shape?.type === 'line') extra = 0
      return Math.round(this.getShapeWidth(element, extra, svgData))
    } else if (element.meta && element.meta.ux.symbolId) {
      return Math.round(element.meta.ux.width + extra)
    } else if (element['uxdesign#bounds']?.width) {
      return element['uxdesign#bounds'].width
    }
    return 1
  },

  getHeight (desechType, element, svgData, addExtra = true) {
    let extra = this.getExtraVolume(desechType, element)
    if (desechType === 'text') {
      return this.getTextHeight(element)
    } else if (desechType === 'icon' || element.shape) {
      if (element.shape?.type === 'line') extra = 0
      return Math.round(this.getShapeHeight(element, extra, svgData))
    } else if (element.meta && element.meta.ux.symbolId) {
      return Math.round(element.meta.ux.height + extra)
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

  getShapeWidth (element, extra, svgData) {
    switch (element.shape?.type) {
      case 'rect':
        return element.shape.width + extra
      case 'line':
        return element.shape.x2
      case 'ellipse':
        return element.shape.cx + element.shape.rx
      case 'polygon':
        return element.shape['uxdesign#width'] + extra
      default:
        // path, compound, group
        return svgData[element.id]?.box?.width
    }
  },

  getShapeHeight (element, extra, svgData) {
    switch (element.shape?.type) {
      case 'rect':
        return element.shape.height + extra
      case 'line':
        return element.style.stroke.width
      case 'ellipse':
        return element.shape.cy + element.shape.ry
      case 'polygon':
        return element.shape['uxdesign#height'] + extra
      default:
        // path, compound, group
        return svgData[element.id]?.box?.height
    }
  },

  getExtraVolume (desechType, element) {
    const stroke = this.getStroke(desechType, element)
    return ParseCommon.getExtraVolume(desechType, stroke)
  },

  getStroke (desechType, element) {
    if (!this.isStrokeAvailable(desechType, element.style)) {
      return {}
    }
    return {
      type: (element.shape && element.shape.type === 'line')
        ? 'outside'
        : (element.style.stroke.align || 'center'),
      size: element.style.stroke.width
    }
  },

  isStrokeAvailable (desechType, style) {
    if (desechType === 'icon' || desechType === 'text') {
      return false
    }
    if (!style || !style.stroke || style.stroke.type === 'none') {
      return false
    }
    return true
  },

  getCssBasic (type, element, svgData) {
    const css = {}
    if (type === 'text' || type === 'inline') return css
    css.width = this.getWidth(type, element, svgData) + 'px'
    const height = this.getHeight(type, element, svgData)
    css.height = height + 'px'
    ParseCommon.setBlockMinHeight(type, height, css)
    return css
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
