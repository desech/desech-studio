import ParseCommon from '../ParseCommon.js'
import FigmaCommon from './FigmaCommon.js'
import File from '../../file/File.js'

export default {
  async getSvgContent (element, extra) {
    // we ignore icons without export settings in FigmaParse.getElementType()
    if (extra.data.type !== 'icon') return
    const data = await FigmaCommon.processImageFile({
      ...extra,
      elementId: element.id,
      fileName: ParseCommon.getName(element.id),
      fileExt: 'svg',
      scale: 1,
      folder: File.resolve(extra.folder, '_desech/cache')
    })
    return { content: data.content }
  },

  processCssFillStroke (data, element) {
    if (data.type !== 'icon') return
    const css = {}
    this.processStrokeSize(data, element, css)
    this.processStrokeColor(data, element, css)
    this.processFill(data, element, css)
    return css
  },

  processStrokeSize (data, element, css) {
    if (element.strokeWeight > 1) {
      css['stroke-width'] = element.strokeWeight + 'px'
      data.content = data.content.replace(/ stroke-width=".*?"/gi, '')
    }
  },

  processStrokeColor (data, element, css) {
    if (element.strokes[0]?.type === 'SOLID') {
      css.stroke = FigmaCommon.getObjectColor(element.strokes[0])
      data.content = data.content.replace(/ stroke=".*?"/gi, '')
    }
  },

  processFill (data, element, css) {
    if (element.fills[0]?.type === 'SOLID') {
      css.fill = FigmaCommon.getObjectColor(element.fills[0])
      data.content = data.content.replace(/ fill=".*?"/gi, '')
    }
  }
}
