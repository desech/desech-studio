import path from 'path'
import ParseCommon from '../ParseCommon.js'
import FigmaCommon from './FigmaCommon.js'

export default {
  async getSvgContent (element, type, extra) {
    // we ignore icons without export settings in FigmaParse.getElementType()
    if (type !== 'icon') return
    const data = await FigmaCommon.processImageFile({
      ...extra,
      elementId: element.id,
      fileName: ParseCommon.getName(element.id),
      fileExt: 'svg',
      scale: 1,
      folder: path.resolve(extra.folder, '_desech/cache')
    })
    return { content: data.content }
  },

  getCssFillStroke (type, element) {
    if (type !== 'icon') return
    const css = {}
    if (element.strokes.length && element.strokes[0].type === 'SOLID') {
      css.stroke = FigmaCommon.getObjectColor(element.strokes[0])
    }
    if (element.fills.length && element.fills[0].type === 'SOLID') {
      css.fill = FigmaCommon.getObjectColor(element.fills[0])
    }
    return css
  }
}
