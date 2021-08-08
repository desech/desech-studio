import FigmaImage from './style/FigmaImage.js'
import ImportCommon from '../ImportCommon.js'
import HelperCrypto from '../../../js/helper/HelperCrypto.js'
import File from '../../file/File.js'

export default {
  async addSvgContent (data, node, settings) {
    if (data.desechType !== 'icon') return
    const file = ImportCommon.getName(node.id)
    const image = await FigmaImage.processImageFile({
      ...settings, // type, folder, file, token, settings, allImages
      elementId: node.id,
      image: {
        file,
        ext: 'svg',
        scale: 1,
        path: File.resolve(settings.folder, '_desech/cache', file + '.svg')
      }
    })
    data.content = this.fixIdRefs(image.content)
    // this.fixWidthHeight(data)
  },

  fixIdRefs (svg) {
    // figma exports the same ids for each gradient, etc, so we need to make them unique
    const rand = HelperCrypto.generateSmallHash()
    return svg.replace(/url\(#(.*?)\)/g, `url(#$1-${rand})`)
      .replace(/id="(.*?)"/g, `id="$1-${rand}"`)
      .replace(/"#image(.*?)"/g, `"#image$1-${rand}"`)
  }

  // @todo arrows have the wrong x,y,w,h; we can extract the width and height from the svg code,
  // but the x and y is still wrong
  // we will use a height of 1 to fix this in ImportCommon.returnSize
  // fixWidthHeight (data) {
  //   const width = /<svg.*? width="(.*?)"/gi.exec(data.content)
  //   if (width && width[1]) data.width = width[1]
  //   const height = /<svg.*? height="(.*?)"/gi.exec(data.content)
  //   if (height && height[1]) data.height = height[1]
  // }
}
