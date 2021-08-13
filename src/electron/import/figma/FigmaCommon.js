import ImportCommon from '../ImportCommon.js'
import EventMain from '../../event/EventMain.js'

export default {
  sendProgress (text) {
    EventMain.ipcMainInvoke('mainImportProgress', text, 'figma')
  },

  getWidth (desechType, node) {
    // don't add the stroke size to the width when processing lines
    const extra = (node.type !== 'LINE') ? this.getExtraVolume(desechType, node) : 0
    const width = Math.round(node.size.x + extra) || 0
    return ImportCommon.returnSize(width, desechType)
  },

  getHeight (desechType, node, addExtra = true) {
    const extra = addExtra ? this.getExtraVolume(desechType, node) : 0
    const height = Math.round(node.size.y + extra) || 0
    return ImportCommon.returnSize(height, desechType)
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
    if (['text', 'icon'].includes(desechType) || !node.strokes?.length) {
      return false
    }
    // the fill already downloaded and rendered the full image with strokes
    // if we have an image fill
    for (const fill of node.fills) {
      if (fill.visible !== false && fill.type === 'IMAGE') return false
    }
    for (const stroke of node.strokes) {
      if (stroke.visible !== false) return true
    }
    return false
  }
}
