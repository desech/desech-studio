import FigmaFill from './FigmaFill.js'
import FigmaCommon from './FigmaCommon.js'
import ParseCommon from '../ParseCommon.js'

export default {
  async getCssStroke (element, extra) {
    if (!FigmaCommon.isStrokeAvailable(extra.data.type, element.strokes)) return
    for (const stroke of element.strokes) {
      if (stroke.visible === false) continue
      const type = FigmaFill.getFillStrokeType(stroke.type)
      if (!FigmaFill.isAllowedFillStrokeType(type, element)) continue
      // we only allow one stroke
      return await this.getCssStrokeRecord(type, stroke, element, extra)
    }
  },

  async getCssStrokeRecord (type, stroke, element, extra) {
    const height = FigmaCommon.getHeight(extra.data.type, element, false)
    return {
      ...ParseCommon.getStrokeSize(element.strokeWeight, height),
      ...ParseCommon.getStrokeStyle(element.strokeDashes ? 'dotted' : 'solid'),
      ...await this[`getStrokeBg${type}`](stroke, element, extra)
    }
  },

  getProperties () {
    return [
      'border-top-color',
      'border-right-color',
      'border-bottom-color',
      'border-left-color',
      'border-image-source',
      'border-image-slice',
      'stroke' // from icon stroke
    ]
  },

  getStrokeBgSolid (stroke) {
    const color = FigmaCommon.getObjectColor(stroke)
    return ParseCommon.getStrokeBgSolid(color)
  },

  getStrokeBgGradientlinear (stroke) {
    return {
      'border-image-source': FigmaFill.getFillBgGradientlinear(stroke),
      'border-image-slice': this.getStrokeSlice()
    }
  },

  getStrokeBgGradientradial (stroke) {
    return {
      'border-image-source': FigmaFill.getFillBgGradientradial(stroke),
      'border-image-slice': this.getStrokeSlice()
    }
  },

  async getStrokeBgImage (stroke, element, extra) {
    return {
      'border-image-source': await FigmaFill.getFillBgImage(stroke, element, extra),
      'border-image-slice': this.getStrokeSlice()
    }
  },

  getStrokeSlice () {
    // otherwise it doesn't show anything
    return '11%'
  }
}
