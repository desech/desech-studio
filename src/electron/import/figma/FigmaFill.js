import ExtendJS from '../../../js/helper/ExtendJS.js'
import FigmaCommon from './FigmaCommon.js'
import ParseCommon from '../ParseCommon.js'
import HelperStyle from '../../../js/helper/HelperStyle.js'
import HelperColor from '../../../js/helper/HelperColor.js'
import File from '../../file/File.js'

export default {
  async getCssFill (element, extra) {
    const fills = element.fills
    if (this.ignoreFill(extra.data.type, fills)) return
    this.addExportFill(element, fills)
    const data = []
    for (let i = fills.length - 1; i >= 0; i--) {
      // fills in reverse order
      const record = await this.getCssFillRecord(fills[i], element, extra)
      if (record) data.push(record)
    }
    return ParseCommon.mergeValues(data, ', ')
  },

  ignoreFill (type, fills) {
    // we also process the fill in FigmaIcon and FigmaText
    if (type === 'icon') return true
    if (type === 'text' && fills.length === 1 &&
      this.getFillStrokeType(fills[0].type) === 'Solid') {
      return true
    }
    return false
  },

  // elements can have export settings but no fill, so we need to manually create a fill
  addExportFill (element, fills) {
    if (element.exportSettings && element.exportSettings.length &&
      !this.hasImageFillStroke(element.fills) && !this.hasImageFillStroke(element.strokes)) {
      fills.push({ type: 'IMAGE' })
    }
  },

  hasImageFillStroke (items) {
    for (const item of items) {
      if (item.visible !== false && item.type === 'IMAGE') return true
    }
    return false
  },

  async getCssFillRecord (fill, element, extra) {
    const type = this.getFillStrokeType(fill.type)
    if (fill.visible === false || !this.isAllowedFillStrokeType(type, element)) return
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

  isAllowedFillStrokeType (type, element) {
    // image fills/strokes need to have export settings
    if (type === 'Image' && (!element.exportSettings || !element.exportSettings.length)) return
    return ['Solid', 'Gradientlinear', 'Gradientradial', 'Image'].includes(type)
  },

  getFillBgSolid (fill) {
    const color = FigmaCommon.getObjectColor(fill)
    return HelperColor.getBackgroundSolidColor(color)
  },

  getFillBgGradientlinear (fill) {
    const handle = fill.gradientHandlePositions
    const angle = ParseCommon.getGradientLinearAngle(handle[0].x, handle[1].x, handle[0].y,
      handle[1].y)
    const stops = this.getGradientStops(fill.gradientStops)
    return `linear-gradient(${angle}deg, ${stops})`
  },

  getFillBgGradientradial (fill) {
    // @todo implement angle properties
    const stops = this.getGradientStops(fill.gradientStops)
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

  getGradientStops (stops) {
    let css = ''
    for (const stop of stops) {
      const color = FigmaCommon.getColor(stop.color.r, stop.color.g, stop.color.b, stop.color.a)
      const position = Math.round(stop.position * 100)
      css += css ? ', ' : ''
      css += `${color} ${position > 100 ? 100 : position}%`
    }
    return css
  }
}
