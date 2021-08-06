import ExtendJS from '../../../js/helper/ExtendJS.js'
import FigmaCommon from './FigmaCommon.js'
import ImportCommon from '../ImportCommon.js'
import FigmaLayout from './style/FigmaLayout.js'
import FigmaStyle from './FigmaStyle.js'
import FigmaFill from './style/FigmaFill.js'

export default {
  async getData (node, file) {
    const desechType = this.getDesechType(node)
    if (!desechType) return
    const data = this.getBasicData(desechType, node, file)
    this.addStyle(data, node)
    return data
  },

  getDesechType (node) {
    switch (node.type) {
      case 'FRAME': case 'RECTANGLE': case 'LINE': case 'ELLIPSE': case 'GROUP':
      case 'COMPONENT': case 'INSTANCE':
        return (node.exportSettings && node.exportSettings[0]?.format === 'SVG')
          ? 'icon'
          : 'block'
      case 'TEXT':
        return 'text'
      case 'VECTOR': case 'REGULAR_POLYGON': case 'STAR': case 'BOOLEAN_OPERATION':
        return 'icon'
      case 'SLICE':
        // ignored
    }
  },

  getBasicData (desechType, node, file) {
    const debug = ExtendJS.cloneData(node)
    delete debug.children
    return {
      desechType,
      designType: ImportCommon.sanitizeName(node.type),
      id: node.id,
      name: node.name.substring(0, 32),
      x: Math.round(node.absoluteBoundingBox.x - file.x),
      y: Math.round(node.absoluteBoundingBox.y - file.y),
      width: FigmaCommon.getWidth(desechType, node),
      height: FigmaCommon.getHeight(desechType, node),
      content: '',
      style: {},
      debug
    }
  },

  addStyle (data, node) {
    data.style = {
      rotation: FigmaStyle.getRotation(node),
      corners: FigmaStyle.getRoundedCorners(node),
      autoLayout: FigmaLayout.getAutoLayout(node),
      hidden: (node.visible === false),
      blendMode: FigmaStyle.getBlendMode(node.blendMode),
      opacity: FigmaStyle.getOpacity(node.opacity),
      fills: FigmaFill.getFills(node)
    }
  }
}
