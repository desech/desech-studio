import ParseCommon from '../ParseCommon.js'
import AdobexdCommon from './AdobexdCommon.js'

export default {
  getCssStroke (type, element, svgData) {
    if (AdobexdCommon.isStrokeAvailable(type, element.style)) {
      return this.getStrokeData(type, element, svgData)
    }
  },

  getStrokeData (type, element, svgData) {
    const stroke = element.style.stroke
    const height = AdobexdCommon.getHeight(type, element, svgData, false)
    return {
      ...ParseCommon.getStrokeSize(stroke.width, height),
      ...ParseCommon.getStrokeStyle(stroke.dash ? 'dotted' : 'solid'),
      ...this.getStrokeBgSolid(stroke.color)
    }
  },

  getStrokeBgSolid (stroke) {
    const color = AdobexdCommon.getColor(stroke)
    return ParseCommon.getStrokeBgSolid(color)
  }
}
