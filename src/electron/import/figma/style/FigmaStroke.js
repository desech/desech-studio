import FigmaCommon from '../FigmaCommon.js'
import FigmaStyle from '../FigmaStyle.js'
import FigmaFill from './FigmaFill.js'

export default {
  async getStroke (data, node, settings) {
    if (!FigmaCommon.isStrokeAvailable(data.desechType, node)) return
    for (const stroke of node.strokes) {
      if (!FigmaStyle.isFillStrokeAllowed(stroke, data.designType)) continue
      return await this.getFirstStroke(stroke, node, settings)
    }
  },

  async getFirstStroke (stroke, node, settings) {
    const record = {
      size: Math.round(node.strokeWeight),
      style: node.strokeDashes ? 'dotted' : 'solid',
      type: FigmaStyle.getFillStrokeType(stroke.type)
    }
    await FigmaFill.processFillType(stroke, node, record, settings)
    return record
  }
}
