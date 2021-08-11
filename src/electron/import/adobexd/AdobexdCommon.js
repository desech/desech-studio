import ImportCommon from '../ImportCommon.js'

export default {
  getX (parentX, node) {
    return Math.round((node.transform?.tx || 0) + parentX)
  },

  getY (parentY, desechType, node) {
    let y = node.transform?.ty || 0
    if (desechType === 'text' && node.text.frame.type !== 'area') {
      y -= this.getHeight(desechType, node)
    }
    if (node.shape?.type === 'line') {
      y -= Math.round(node.style.stroke.width / 2)
    }
    return Math.round(y + parentY)
  },

  getWidth (desechType, node) {
    // don't add the stroke size to the width when processing lines
    let extra = this.getExtraVolume(desechType, node)
    if (desechType === 'text') {
      return this.getTextWidth(node)
    } else if (desechType === 'icon' || node.shape) {
      if (node.shape?.type === 'line') extra = 0
      return Math.round(this.getShapeWidth(node, extra))
    } else if (node.meta && node.meta.ux.symbolId) {
      return Math.round(node.meta.ux.width + extra)
    } else if (node['uxdesign#bounds']?.width) {
      return node['uxdesign#bounds'].width
    }
  },

  getHeight (desechType, node, addExtra = true) {
    let extra = this.getExtraVolume(desechType, node)
    if (desechType === 'text') {
      return this.getTextHeight(node)
    } else if (desechType === 'icon' || node.shape) {
      if (node.shape?.type === 'line') extra = 0
      return Math.round(this.getShapeHeight(node, extra))
    } else if (node.meta && node.meta.ux.symbolId) {
      return Math.round(node.meta.ux.height + extra)
    } else if (node['uxdesign#bounds']?.height) {
      return node['uxdesign#bounds'].height
    }
  },

  getTextWidth (node) {
    if (node.text.frame.type === 'area') {
      return parseInt(node.text.frame.width)
    } else {
      // @todo wait for adobexd to provide exact values
      // usually a character width is a bit bigger than half the font size,
      // and the W char is, for some fonts, the same as the font size
      // but we don't want to approximate a bigger width because it will clip,
      // so we want a smaller width in order to fit
      return Math.round(node.style.font.size / 2 * node.text.rawText.length)
    }
  },

  getTextHeight (node) {
    if (node.text.frame.type === 'area') {
      return parseInt(node.text.frame.height)
    } else {
      // @todo wait for adobexd to provide exact values
      // the average line height is 1.2, but we have fonts with 0.5 and some with 2.3,
      // but we will use a value of 1 to have the height a bit smaller to not clip
      return Math.round(node.style.font.size * 1)
    }
  },

  getShapeWidth (node, extra) {
    switch (node.shape?.type) {
      case 'rect':
        return node.shape.width + extra
      case 'line':
        return node.shape.x2
      case 'ellipse':
        return node.shape.cx + node.shape.rx
      case 'polygon':
        return node.shape['uxdesign#width'] + extra
      default:
        // path, compound; we will later change it
        return 0
    }
  },

  getShapeHeight (node, extra, svgData) {
    switch (node.shape?.type) {
      case 'rect':
        return node.shape.height + extra
      case 'line':
        return node.style.stroke.width
      case 'ellipse':
        return node.shape.cy + node.shape.ry
      case 'polygon':
        return node.shape['uxdesign#height'] + extra
      default:
        // path, compound; we will later change it
        return 0
    }
  },

  getExtraVolume (desechType, node) {
    const stroke = this.getStroke(desechType, node)
    return ImportCommon.getExtraVolume(desechType, stroke)
  },

  getStroke (desechType, node) {
    if (this.isStrokeAvailable(desechType, node.style)) {
      return {
        type: (node.shape && node.shape.type === 'line')
          ? 'outside'
          : (node.style.stroke.align || 'center'),
        size: node.style.stroke.width
      }
    }
  },

  isStrokeAvailable (desechType, style) {
    return (desechType !== 'text' && style?.stroke && style.stroke?.type !== 'none')
  }
}
