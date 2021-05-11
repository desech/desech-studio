import ParseCommon from '../ParseCommon.js'
import SketchCommon from './SketchCommon.js'
import HelperStyle from '../../../js/helper/HelperStyle.js'
import HelperColor from '../../../js/helper/HelperColor.js'

export default {
  async getCssFill (extra) {
    if (extra.data.type === 'icon') {
      return SketchCommon.getIconFill(extra.element.style.fills)
    }
    if (this.ignoreFill(extra.data.type, extra.element.style.fills)) {
      return
    }
    const array = []
    await this.addBitmapFill(array, extra)
    await this.addFillRecords(array, extra)
    return ParseCommon.mergeValues(array, ', ')
  },

  ignoreFill (type, fills) {
    if (type === 'text' && fills && fills.length === 1 && fills[0].isEnabled &&
      SketchCommon.getFillType(fills[0]) === 'Solid') {
      return true
    }
    return false
  },

  async addBitmapFill (array, extra) {
    if (extra.element._class !== 'bitmap' || !this.isFillAllowed('Image', extra.element)) {
      return
    }
    const source = await this.processLocalImages(extra.element.image._ref, extra)
    const record = this.getFillProperties('Image', source, extra.element.style.contextSettings)
    array.push(record)
  },

  async processLocalImages (imagePath, extra) {
    if (!imagePath.includes('.')) imagePath += '.png'
    const ext = extra.element.exportOptions.exportFormats[0].fileFormat
    return await ParseCommon.processLocalImages(imagePath, ext, extra)
  },

  async addFillRecords (array, extra) {
    const fills = extra.element.style.fills
    if (!fills) return
    for (let i = fills.length - 1; i >= 0; i--) {
      // fills in reverse order
      if (!fills[i].isEnabled) continue
      const record = await this.getCssFillRecord(fills[i], extra)
      if (record) array.push(record)
    }
  },

  async getCssFillRecord (fill, extra) {
    const type = SketchCommon.getFillType(fill)
    if (!this.isFillAllowed(type, extra.element)) return
    const source = await this[`getFillBg${type}`](fill, extra)
    return this.getFillProperties(type, source, fill.contextSettings)
  },

  isFillAllowed (type, element) {
    // image fills need to have export settings
    return (type && (type !== 'Image' || (element.exportOptions &&
      element.exportOptions.exportFormats.length)))
  },

  getFillProperties (type, source, settings) {
    return {
      'background-image': source,
      'background-blend-mode': SketchCommon.getBlendMode(settings),
      'background-size': (type === 'Image')
        ? 'contain'
        : HelperStyle.getDefaultProperty('background-size'),
      'background-repeat': (type === 'Image')
        ? 'no-repeat'
        : HelperStyle.getDefaultProperty('background-repeat'),
      'background-position': HelperStyle.getDefaultProperty('background-position'),
      'background-attachment': HelperStyle.getDefaultProperty('background-attachment'),
      'background-origin': HelperStyle.getDefaultProperty('background-origin')
    }
  },

  getFillBgSolid (fill) {
    const color = SketchCommon.getColor(fill.color)
    return HelperColor.getBackgroundSolidColor(color)
  },

  getFillBgGradientlinear (fill) {
    const positions = this.getGradientAnglePositions(fill.gradient.from, fill.gradient.to)
    const angle = ParseCommon.getGradientLinearAngle(...positions)
    const stops = this.getGradientStops(fill.gradient.stops)
    return `linear-gradient(${angle}deg, ${stops})`
  },

  getFillBgGradientradial (fill) {
    // @todo implement angle properties
    const stops = this.getGradientStops(fill.gradient.stops)
    return `radial-gradient(${stops})`
  },

  async getFillBgImage (fill, extra) {
    return await this.processLocalImages(fill.image._ref, extra)
  },

  getGradientAnglePositions (from, to) {
    // string value = {0.4709482491016388, 0.49367088079452515}
    const f = from.replace('{', '').replace('}', '').split(', ')
    const t = to.replace('{', '').replace('}', '').split(', ')
    // x1, x2, y1, y2
    return [f[0], t[0], f[1], t[1]]
  },

  getGradientStops (stops) {
    let css = ''
    for (const stop of stops) {
      const color = SketchCommon.getColor(stop.color)
      const position = Math.round(stop.position * 100)
      css += css ? ', ' : ''
      css += `${color} ${position > 100 ? 100 : position}%`
    }
    return css
  }
}
