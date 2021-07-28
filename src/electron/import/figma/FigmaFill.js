import ExtendJS from '../../../js/helper/ExtendJS.js'
import FigmaCommon from './FigmaCommon.js'
import ParseCommon from '../ParseCommon.js'
import HelperStyle from '../../../js/helper/HelperStyle.js'
import HelperColor from '../../../js/helper/HelperColor.js'
import File from '../../file/File.js'

export default {
  async getCssFill (element, extra) {
    if (this.ignoreFill(element, extra.data.type, element.fills)) return
    this.clearFillsWhenExportImage(element)
    const data = []
    for (let i = element.fills.length - 1; i >= 0; i--) {
      // fills in reverse order
      const record = await this.getCssFillRecord(element.fills[i], element, extra)
      if (record) data.push(record)
    }
    return ParseCommon.mergeValues(data, ', ')
  },

  ignoreFill (element, htmlType, fills) {
    // we also process the fill in FigmaIcon and FigmaText
    return (element.type === 'LINE' || htmlType === 'icon' ||
      (htmlType === 'text' && fills.length === 1 &&
      this.getFillStrokeType(fills[0].type) === 'Solid'))
  },

  // if we have export settings then we need to clear the other non image fills
  // if we don't have an image fill then we need to create it
  clearFillsWhenExportImage (element) {
    if (!element.exportSettings?.length) return
    if (!FigmaCommon.hasImageFill(element.fills)) {
      element.fills = [{ type: 'IMAGE' }]
    } else {
      for (let i = element.fills.length - 1; i >= 0; i--) {
        if (element.fills[i].type !== 'IMAGE') element.fills.splice(i, 1)
      }
    }
  },

  async getCssFillRecord (fill, element, extra) {
    const type = this.getFillStrokeType(fill.type)
    if (fill.visible === false || !FigmaCommon.isAllowedFillStrokeType(type, element)) return
    return {
      'background-image': await this[`getFillBg${type}`](fill, element, extra),
      'background-blend-mode': FigmaCommon.getBlendMode(fill.blendMode),
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

  getProperties () {
    return [
      ...ParseCommon.getBackgroundProperties(),
      'color', // from text fill
      'fill' // from icon fill
    ]
  },

  getFillStrokeType (type) {
    // SOLID, GRADIENT_LINEAR, GRADIENT_RADIAL, GRADIENT_ANGULAR, GRADIENT_DIAMOND, IMAGE
    return ExtendJS.capitalize(type.toLowerCase().replace('_', ''))
      .replace(/angular|diamond/, 'radial')
  },

  getFillBgSolid (fill) {
    const color = FigmaCommon.getObjectColor(fill)
    return HelperColor.getBackgroundSolidColor(color)
  },

  getFillBgGradientlinear (fill) {
    const handle = fill.gradientHandlePositions
    const angle = ParseCommon.getGradientLinearAngle(handle[0].x, handle[1].x, handle[0].y,
      handle[1].y)
    const stops = this.getGradientStops(fill.opacity, fill.gradientStops)
    return `linear-gradient(${angle}deg, ${stops})`
  },

  getFillBgGradientradial (fill) {
    // @todo add radial gradient properties
    const stops = this.getGradientStops(fill.opacity, fill.gradientStops)
    return `radial-gradient(${stops})`
  },

  async getFillBgImage (fill, element, extra) {
    const fileName = ParseCommon.getImageName(element.name, element.id, extra.figmaImages)
    const data = await this.getImageFile(fileName, 1, element, extra)
    await this.getImageFile(fileName + '@2x', 2, element, extra)
    await this.getImageFile(fileName + '@3x', 3, element, extra)
    return ParseCommon.getImageUrl(data.file, extra.folder)
  },

  async getImageFile (fileName, scale, element, extra) {
    return await FigmaCommon.processImageFile({
      ...extra,
      elementId: element.id,
      fileName,
      fileExt: element.exportSettings[0].format.toLowerCase(),
      scale,
      folder: File.resolve(extra.folder, 'asset/image')
    })
  },

  getGradientStops (opacity, stops) {
    let css = ''
    for (const stop of stops) {
      const alpha = (typeof opacity !== 'undefined') ? opacity * stop.color.a : stop.color.a
      const color = FigmaCommon.getColor(stop.color.r, stop.color.g, stop.color.b, alpha)
      const position = Math.round(stop.position * 100)
      css += css ? ', ' : ''
      css += `${color} ${position > 100 ? 100 : position}%`
    }
    return css
  }
}
