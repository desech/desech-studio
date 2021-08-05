import ParseCommon from '../ParseCommon.js'
import FigmaCommon from './FigmaCommon.js'
import File from '../../file/File.js'
import HelperCrypto from '../../../js/helper/HelperCrypto.js'

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
    return { content: this.fixIdRefs(data.content) }
  },

  fixIdRefs (svg) {
    // figma exports the same ids for each gradient, etc, so we need to make them unique
    const rand = HelperCrypto.generateSmallHash()
    return svg.replace(/url\(#(.*?)\)/g, `url(#$1-${rand})`)
      .replace(/id="(.*?)"/g, `id="$1-${rand}"`)
      .replace(/"#image(.*?)"/g, `"#image$1-${rand}"`)
  }

  // we can't have svg css because figma places svg attributes all over the place,
  // so we don't know from where to take them; is it <svg>, 1st <path>, <g>, etc?
  // processCssFillStroke (data, element) {
  //   if (data.type !== 'icon') return
  //   const css = {}
  //   this.processStrokeSize(data, element, css)
  //   this.processStrokeDash(data, element, css)
  //   this.processStrokeColor(data, element, css)
  //   this.processFill(data, element, css)
  //   return css
  // },

  // processStrokeSize (data, element, css) {
  //   if (element.strokeWeight > 1) {
  //     css['stroke-width'] = element.strokeWeight + 'px'
  //     data.content = data.content.replace(/ stroke-width=".*?"/gi, '')
  //   }
  // },

  // processStrokeDash (data, element, css) {
  //   if (element.strokeDashes && (element.strokeDashes[0] > 0 || element.strokeDashes[1] > 0)) {
  //     css['stroke-dasharray'] = element.strokeDashes.join(' ')
  //     data.content = data.content.replace(/ stroke-dasharray=".*?"/gi, '')
  //   }
  // },

  // processStrokeColor (data, element, css) {
  //   if (element.strokes[0]?.type === 'SOLID') {
  //     css.stroke = FigmaCommon.getObjectColor(element.strokes[0])
  //     data.content = data.content.replace(/ stroke=".*?"/gi, '')
  //   }
  // },

  // processFill (data, element, css) {
  //   if (element.fills[0]?.type === 'SOLID') {
  //     css.fill = FigmaCommon.getObjectColor(element.fills[0])
  //     data.content = data.content.replace(/ fill=".*?"/gi, '')
  //   }
  // }
}
