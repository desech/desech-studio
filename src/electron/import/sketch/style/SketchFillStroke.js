import SketchStyle from '../SketchStyle.js'
import SketchCommon from '../SketchCommon.js'
import ImportImage from '../../ImportImage.js'
import File from '../../../file/File.js'
import ExtendJS from '../../../../js/helper/ExtendJS.js'

export default {
  async getFills (data, node, settings = null) {
    const fills = node.style?.fills
    if (!fills) return
    const records = []
    await this.addBitmapFill(records, data, node, settings)
    await this.processFills(fills, data, records, settings)
    if (records.length) return records
  },

  async addBitmapFill (records, data, node, settings) {
    if (data.designType !== 'bitmap') return
    const record = { type: 'image' }
    await this.getFillImage(node, record, data, settings)
    records.push(record)
  },

  async processFills (fills, data, records, settings) {
    for (let i = fills.length - 1; i >= 0; i--) {
      if (!fills[i].isEnabled) continue
      const record = await this.getFill(fills[i], data, settings)
      if (record) records.push(record)
    }
  },

  async getFill (fill, data, settings) {
    const record = {
      type: this.getType(fill),
      blendMode: SketchStyle.getBlendMode(fill)
    }
    await this.processFillType(fill, record, data, settings)
    return record
  },

  getType (fill) {
    switch (fill.fillType) {
      case 0:
        return 'solid-color'
      case 1:
        if (fill.gradient.gradientType === 0) {
          return 'linear-gradient'
        } else { // 1 (radial), 2 (angular)
          return 'radial-gradient'
        }
      case 4:
        return 'image'
    }
  },

  async processFillType (fill, record, data, settings) {
    const layerOpacity = SketchStyle.getOpacity(fill)
    switch (record.type) {
      case 'solid-color':
        return this.getFillSolid(fill, record)
      case 'linear-gradient':
        return this.getFillLinearGradient(fill, layerOpacity, record)
      case 'radial-gradient':
        return this.getFillRadialGradient(fill, layerOpacity, record)
      case 'image':
        return await this.getFillImage(fill, record, data, settings)
    }
  },

  getFillSolid (fill, record) {
    // the color opacity is the same with the layer opacity
    record.color = SketchStyle.getColor(fill.color)
  },

  getFillLinearGradient (fill, layerOpacity, record) {
    record.coords = this.getGradientAnglePositions(fill.gradient.from, fill.gradient.to)
    record.stops = this.getGradientStops(fill.gradient.stops, layerOpacity)
  },

  getFillRadialGradient (fill, layerOpacity, record) {
    // these coordinates are used by svg; @todo make use of them in css too
    record.coords = this.getGradientCirclePositions(fill.gradient.from, fill.gradient.to)
    record.stops = this.getGradientStops(fill.gradient.stops, layerOpacity)
  },

  async getFillImage (fill, record, data, settings) {
    const image = {
      file: fill.image._ref,
      ext: File.extname(fill.image._ref, true) || 'png',
      width: data.width
    }
    record.image = await ImportImage.processLocalImages(image, data, settings)
    // the width and height are used by the svg builder
    record.width = data.width
    record.height = data.height
  },

  getGradientAnglePositions (from, to) {
    // @todo gradient angle is not calculated correctly
    // string value = {0.4709482491016388, 0.49367088079452515}
    const f = from.replace('{', '').replace('}', '').split(', ')
    const t = to.replace('{', '').replace('}', '').split(', ')
    return { x1: f[0], x2: t[0], y1: f[1], y2: t[1] }
  },

  getGradientCirclePositions (from, to) {
    // @todo gradient angle is not calculated correctly
    // same values as the linear gradient, so no radius, etc, which we can't use
    return { cx: 0, cy: 0, r: 0 }
  },

  getGradientStops (stops, layerOpacity) {
    const values = []
    for (const stop of stops) {
      values.push({
        color: SketchStyle.getColor({ ...stop.color, layerOpacity }),
        position: ExtendJS.roundToTwo(stop.position)
      })
    }
    return values
  },

  async getStroke (data, node, settings) {
    if (!SketchCommon.isStrokeAvailable(data.desechType, node.style.borders)) {
      return
    }
    for (const stroke of node.style.borders) {
      if (stroke.isEnabled) {
        return await this.getFirstStroke(stroke, data, node, settings)
      }
    }
  },

  async getFirstStroke (stroke, data, node, settings) {
    const record = {
      size: Math.round(stroke.thickness),
      dash: node.style.borderOptions?.dashPattern?.length ? 'dotted' : 'solid',
      // we can't have border images
      type: this.getType(stroke)
    }
    await this.processFillType(stroke, record, data, settings)
    return record
  }
}
