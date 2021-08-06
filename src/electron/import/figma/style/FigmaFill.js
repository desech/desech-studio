import FigmaStyle from '../FigmaStyle.js'
import ExtendJS from '../../../../js/helper/ExtendJS.js'

export default {
  getFills (node) {
    const records = []
    for (const fill of node.fills) {
      if (fill.visible) records.push(this.getFill(fill))
    }
    if (records.length) return records
  },

  getFill (fill) {
    const record = {
      type: FigmaStyle.getFillStrokeType(fill.type),
      blendMode: FigmaStyle.getBlendMode(fill.blendMode)
    }
    this.processFillType(fill, record)
    return record
  },

  processFillType (fill, record) {
    switch (record.type) {
      case 'solid-image':
        return this.getFillSolid(fill, record)
      case 'linear-gradient':
        return this.getFillLinearGradient(fill, record)
      case 'radial-gradient':
        return this.getFillRadialGradient(fill, record)
      case 'image':
        return this.getFillImage(fill, record)
    }
  },

  getFillSolid (fill, record) {
    record.color = FigmaStyle.getColor(fill)
  },

  getFillLinearGradient (fill, record) {
    record.angle = {
      x1: fill.gradientHandlePositions[0].x,
      x2: fill.gradientHandlePositions[1].x,
      y1: fill.gradientHandlePositions[0].y,
      y2: fill.gradientHandlePositions[1].y
    }
    record.stops = this.getGradientStops(fill.gradientStops, fill.opacity)
  },

  getFillRadialGradient (fill, record) {
    record.stops = this.getGradientStops(fill.gradientStops, fill.opacity)
  },

  getFillImage (fill, record) {
    record.scale = this.getImageScale(fill.scaleMode)
    record.image = fill.imageRef
  },

  getGradientStops (stops, opacity) {
    const values = []
    for (const stop of stops) {
      values.push({
        color: FigmaStyle.getColor({ ...stop, opacity }),
        position: ExtendJS.roundToTwo(stop.position)
      })
    }
    return values
  },

  getImageScale (mode) {
    switch (mode) {
      case 'FILL': case 'FIT': case 'STRETCH': case 'TILE'
      // scaleMode
      // imageTransform - crop
      // scalingFactor - tile
      // rotation
    }
  }
}
