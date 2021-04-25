import AdobexdCommon from './AdobexdCommon.js'
import ParseCommon from '../ParseCommon.js'
import HelperStyle from '../../../js/helper/HelperStyle.js'
import HelperColor from '../../../js/helper/HelperColor.js'
import File from '../../file/File.js'

export default {
  async getCssFill (extra) {
    // you can only have one fill
    const fill = extra.element.style.fill
    if (!fill) return
    const fillType = this.getFillType(fill)
    if (!this.isFillAllowed(fillType, extra)) return
    return await this.getFillData(fillType, fill, extra)
  },

  getFillType (fill) {
    if (fill.gradient && fill.gradient.meta.ux.gradientResources.type === 'linear') {
      return 'Gradientlinear'
    } else if (fill.gradient && fill.gradient.meta.ux.gradientResources.type === 'radial') {
      return 'Gradientradial'
    } else if (fill.type === 'solid') {
      return 'Solid'
    } else if (fill.type === 'pattern') {
      return 'Image'
    }
  },

  isFillAllowed (fillType, extra) {
    if (!fillType || extra.data.type === 'icon' || (extra.data.type === 'text' &&
      fillType === 'Solid')) {
      return false
    }
    if (fillType === 'Image' && !extra.element.meta.ux.markedForExport) return false
    return true
  },

  async getFillData (type, fill, extra) {
    return {
      'background-image': await this[`getFillBg${type}`](fill, extra),
      'background-blend-mode': HelperStyle.getDefaultProperty('background-blend-mode'),
      'background-size': (type === 'Image') ? 'contain'
        : HelperStyle.getDefaultProperty('background-size'),
      'background-repeat': (type === 'Image') ? 'no-repeat'
        : HelperStyle.getDefaultProperty('background-repeat'),
      'background-position': HelperStyle.getDefaultProperty('background-position'),
      'background-attachment': HelperStyle.getDefaultProperty('background-attachment'),
      'background-origin': HelperStyle.getDefaultProperty('background-origin')
    }
  },

  getFillBgSolid (fill) {
    const color = AdobexdCommon.getColor(fill.color)
    return HelperColor.getBackgroundSolidColor(color)
  },

  getFillBgGradientlinear (fill) {
    const angle = ParseCommon.getGradientLinearAngle(fill.gradient.x1, fill.gradient.x2,
      fill.gradient.y1, fill.gradient.y2)
    const stops = this.getGradientStops(fill.gradient.meta.ux.gradientResources.stops)
    return `linear-gradient(${angle}deg, ${stops})`
  },

  getFillBgGradientradial (fill) {
    // @todo implement angle properties
    const stops = this.getGradientStops(fill.gradient.meta.ux.gradientResources.stops)
    return `radial-gradient(${stops})`
  },

  async getFillBgImage (fill, extra) {
    const imagePath = 'resources/' + fill.pattern.meta.ux.uid
    const ext = File.extname(fill.pattern.href).substring(1)
    return await ParseCommon.processLocalImages(imagePath, ext, extra)
  },

  getGradientStops (stops) {
    let css = ''
    for (const stop of stops) {
      const color = AdobexdCommon.getColor(stop.color)
      const position = Math.round(stop.offset * 100)
      css += css ? ', ' : ''
      css += `${color} ${position > 100 ? 100 : position}%`
    }
    return css
  }
}
