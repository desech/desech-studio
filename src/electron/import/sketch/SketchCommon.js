import ImportCommon from '../ImportCommon.js'

export default {
  getWidth (desechType, node) {
    const extra = this.getExtraVolume(desechType, node)
    return Math.round(node.frame.width + extra)
  },

  getHeight (desechType, node, addExtra = true) {
    const extra = addExtra ? this.getExtraVolume(desechType, node) : 0
    return Math.round(node.frame.height + extra)
  },

  getExtraVolume (desechType, node) {
    if (!node.style) return 0
    const stroke = this.getStroke(desechType, node.style.borders)
    return ImportCommon.getExtraVolume(desechType, stroke)
  },

  getStroke (desechType, strokes) {
    if (this.isStrokeAvailable(desechType, strokes)) {
      return {
        type: this.getStrokeType(strokes[0].position),
        size: strokes[0].thickness
      }
    }
  },

  isStrokeAvailable (desechType, strokes) {
    if (desechType === 'text' || !strokes?.length) {
      return false
    }
    for (const stroke of strokes) {
      if (stroke.isEnabled) return true
    }
    return false
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
  }
}
