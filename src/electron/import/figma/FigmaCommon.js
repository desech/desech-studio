import ImportCommon from '../ImportCommon.js'
import EventMain from '../../event/EventMain.js'

export default {
  sendProgress (text) {
    EventMain.ipcMainInvoke('mainImportProgress', text, 'figma')
  },

  getWidth (desechType, node) {
    // don't add the stroke size to the width when processing lines
    const extra = (node.type !== 'LINE') ? this.getExtraVolume(desechType, node) : 0
    return Math.round(node.absoluteBoundingBox.width + extra) || 0
  },

  getHeight (desechType, node, addExtra = true) {
    const extra = addExtra ? this.getExtraVolume(desechType, node) : 0
    return Math.round(node.absoluteBoundingBox.height + extra) || 0
  },

  getExtraVolume (desechType, node) {
    const stroke = this.getStroke(desechType, node)
    return ImportCommon.getExtraVolume(desechType, stroke)
  },

  getStroke (desechType, node) {
    if (this.isStrokeAvailable(desechType, node)) {
      return {
        type: node.strokeAlign.toLowerCase(),
        size: node.strokeWeight
      }
    }
  },

  isStrokeAvailable (desechType, node) {
    if (desechType === 'text' || !node.strokes?.length) return false
    for (const stroke of node.strokes) {
      if (stroke.visible) return true
    }
    return false
  }
}
