import SketchFill from './SketchFill.js'
import ParseCommon from '../ParseCommon.js'
import SketchCommon from './SketchCommon.js'

export default {
  getCssStroke (elementType, element) {
    if (elementType === 'icon') return SketchCommon.getIconStroke(element.style.borders)
    if (!SketchCommon.isStrokeAvailable(elementType, element.style.borders)) return
    for (const stroke of element.style.borders) {
      const type = SketchCommon.getFillType(stroke)
      // we only allow one stroke; there's no image stroke
      if (!stroke.isEnabled || !type) continue
      return this.getCssStrokeRecord(type, stroke, elementType, element)
    }
  },

  getCssStrokeRecord (type, stroke, elementType, element) {
    const options = element.style.borderOptions
    const style = options && options.dashPattern && options.dashPattern[0] ? 'dotted' : 'solid'
    const height = SketchCommon.getHeight(elementType, element, false)
    return {
      ...ParseCommon.getStrokeSize(stroke.thickness, height),
      ...ParseCommon.getStrokeStyle(style),
      ...this[`getStrokeBg${type}`](stroke)
    }
  },

  getStrokeBgSolid (stroke) {
    const color = SketchCommon.getColor(stroke.color)
    return ParseCommon.getStrokeBgSolid(color)
  },

  getStrokeBgGradientlinear (stroke) {
    return {
      'border-image-source': SketchFill.getFillBgGradientlinear(stroke),
      'border-image-slice': this.getStrokeSlice()
    }
  },

  getStrokeBgGradientradial (stroke) {
    return {
      'border-image-source': SketchFill.getFillBgGradientradial(stroke),
      'border-image-slice': this.getStrokeSlice()
    }
  },

  getStrokeSlice () {
    // otherwise it doesn't show anything
    return '11%'
  }
}
