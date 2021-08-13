import ImportCommon from '../ImportCommon.js'

export default {
  _lineHeight: 1.2,
  _charSpace: 2,

  getX (parentX, node) {
    return Math.round((node.transform?.tx || 0) + parentX)
  },

  getY (parentY, desechType, node) {
    let y = node.transform?.ty || 0
    if (desechType === 'text' && node.text.frame.type === 'positioned') {
      y -= Math.round(node.style.font.size * this._lineHeight)
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

  // "positioned" needs y/width/height, "autoHeight" needs height
  getTextWidth (node) {
    if (node.text.frame.width) {
      return parseInt(node.text.frame.width)
    } else {
      // @todo wait for adobexd to provide exact values
      // usually a character width is a bit bigger than half the font size,
      // and the W char is, for some fonts, the same as the font size
      // but we don't want to approximate a bigger width because it will clip,
      // so we want a smaller width in order to fit
      // we also need to take into account new lines to break the text
      return Math.round(node.style.font.size / this._charSpace * this.getLineCharCount(node))
    }
  },

  getTextHeight (node) {
    if (node.text.frame.height) {
      return parseInt(node.text.frame.height)
    } else if (node.text.frame.type === 'autoHeight') {
      // for auto height we need to calculate the lines using `paragraphs.lines` not `\n`
      return Math.round(node.style.font.size * this._lineHeight * this.getDataLinesCount(node))
    } else {
      // @todo wait for adobexd to provide exact values
      // the average line height is 1.2, but we have fonts with 0.5 and some with 2.3
      return Math.round(node.style.font.size * this._lineHeight * this.getNewLinesCount(node))
    }
  },

  getLineCharCount (node) {
    const lines = this.getNewLinesCount(node)
    return Math.round(node.text.rawText.length / lines)
  },

  getNewLinesCount (node) {
    return Array.from(node.text.rawText.matchAll('\n')).length + 1
  },

  getDataLinesCount (node) {
    let count = 0
    for (const paragraph of node.text.paragraphs) {
      count += paragraph.lines.length
    }
    return count
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
        type: this.getStrokeType(node),
        size: node.style.stroke.width
      }
    }
  },

  isStrokeAvailable (desechType, style) {
    return (desechType !== 'text' && style?.stroke && style.stroke?.type !== 'none')
  },

  getStrokeType (node) {
    return (node.shape?.type === 'line') ? 'outside' : (node.style.stroke.align || 'center')
  }
}
