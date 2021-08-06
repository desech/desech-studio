import FigmaImage from './style/FigmaImage.js'
import ImportCommon from '../ImportCommon.js'
import HelperCrypto from '../../../js/helper/HelperCrypto.js'
import File from '../../file/File.js'

export default {
  async addSvgContent (data, node, settings) {
    if (data.desechType !== 'icon') return
    const file = ImportCommon.getName(node.id)
    const image = await FigmaImage.processImageFile({
      ...settings, // type, folder, file, token, allImages
      elementId: node.id,
      image: {
        file,
        ext: 'svg',
        scale: 1,
        path: File.resolve(settings.folder, '_desech/cache', file + '.svg')
      }
    })
    data.content = this.fixIdRefs(image.content)
  },

  fixIdRefs (svg) {
    // figma exports the same ids for each gradient, etc, so we need to make them unique
    const rand = HelperCrypto.generateSmallHash()
    return svg.replace(/url\(#(.*?)\)/g, `url(#$1-${rand})`)
      .replace(/id="(.*?)"/g, `id="$1-${rand}"`)
      .replace(/"#image(.*?)"/g, `"#image$1-${rand}"`)
  }
}
