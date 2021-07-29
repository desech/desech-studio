import fs from 'fs'
import jimp from 'jimp'
import ExtendJS from '../../js/helper/ExtendJS.js'
import HelperCrypto from '../../js/helper/HelperCrypto.js'
import HelperColor from '../../js/helper/HelperColor.js'
import File from '../file/File.js'

export default {
  getName (string, obj = null) {
    let name = this.sanitizeName(string)
    if (obj && obj[name]) name += '-' + HelperCrypto.generateSmallHash()
    return name
  },

  sanitizeName (name) {
    return name.toLowerCase().replace(/([^a-z0-9])/g, '-')
  },

  getNameWithId (name, namesObj, id, idsObj) {
    if (idsObj[id]) {
      return idsObj[id]
    } else {
      const finalName = this.getName(name, namesObj)
      idsObj[id] = finalName
      return finalName
    }
  },

  sanitizeSelectorName (selector) {
    return (/^\d/.test(selector)) ? 's' + selector : selector
  },

  isHidden (visible) {
    return typeof visible !== 'undefined' && visible === false
  },

  getRoundedBorders (rect) {
    return {
      'border-top-left-radius': Math.round(rect[0]) + 'px',
      'border-top-right-radius': Math.round(rect[1]) + 'px',
      'border-bottom-right-radius': Math.round(rect[2]) + 'px',
      'border-bottom-left-radius': Math.round(rect[3]) + 'px'
    }
  },

  getCircleRoundedBorders () {
    return {
      'border-top-left-radius': '50%',
      'border-top-right-radius': '50%',
      'border-bottom-right-radius': '50%',
      'border-bottom-left-radius': '50%'
    }
  },

  getColor (rgb, alpha) {
    alpha = ExtendJS.roundToTwo(alpha)
    return HelperColor.rgbToCss(rgb, alpha)
  },

  getGradientLinearAngle (x1, x2, y1, y2) {
    // @todo fix gradient angle
    const radians = Math.atan((y2 - y1) / (x2 - x1) * -1)
    return parseInt(((180 * radians) / Math.PI).toFixed(1))
  },

  // getGradientLinearAngle2 (m00, m01, m02, m10, m11, m12) {
  //   const s = { m00, m01, m02, m10, m11, m12 }
  //   const e = (function (e) {
  //     const t = e.m00 * e.m11 - e.m01 * e.m10
  //     if (t === 0) {
  //       return {
  //         m00: 1,
  //         m01: 0,
  //         m02: 0,
  //         m10: 0,
  //         m11: 1,
  //         m12: 0
  //       }
  //     }
  //     const o = 1 / t
  //     return {
  //       m00: e.m11 * o,
  //       m01: -e.m01 * o,
  //       m02: (e.m01 * e.m12 - e.m11 * e.m02) * o,
  //       m10: -e.m10 * o,
  //       m11: e.m00 * o,
  //       m12: (e.m10 * e.m02 - e.m00 * e.m12) * o
  //     }
  //   })(s)
  //   const r = e.m00 * e.m11 - e.m01 * e.m10 > 0 ? 1 : -1
  //   const i = (function (e, t) {
  //     return {
  //       x: e.m00 * t.x + e.m01 * t.y,
  //       y: e.m10 * t.x + e.m11 * t.y
  //     }
  //   })(e, {
  //     x: 0,
  //     y: 1
  //   })
  //   const t = ((Math.atan2(i.y * r, i.x * r) / Math.PI) * 180).toFixed(2)
  //   return t
  // },

  setBlockMinHeight (type, height, css) {
    if (type === 'block' && height < 24) css['min-height'] = 'auto'
  },

  getStrokeSize (size, height) {
    size = Math.round(size)
    if (height > size) {
      return {
        'border-image-width': size + 'px',
        'border-top-width': size + 'px',
        'border-right-width': size + 'px',
        'border-bottom-width': size + 'px',
        'border-left-width': size + 'px'
      }
    } else {
      return {
        'border-image-width': size + 'px 0px 0px 0px',
        'border-top-width': size + 'px',
        'border-right-width': '0px',
        'border-bottom-width': '0px',
        'border-left-width': '0px'
      }
    }
  },

  getStrokeStyle (style) {
    return {
      'border-top-style': style,
      'border-right-style': style,
      'border-bottom-style': style,
      'border-left-style': style
    }
  },

  getStrokeBgSolid (color) {
    return {
      'border-top-color': color,
      'border-right-color': color,
      'border-bottom-color': color,
      'border-left-color': color
    }
  },

  getBackgroundProperties () {
    return [
      'background-image',
      'background-blend-mode',
      'background-size',
      'background-position',
      'background-repeat',
      'background-attachment',
      'background-origin'
    ]
  },

  getFontFamily (font, css) {
    // we accept all type of fonts, not just google fonts
    // we will remove the non google fonts later
    if (!font) return
    // add the font to our css list
    if (!css.font.includes(font)) css.font.push(font)
    return { 'font-family': font }
  },

  getPropValue (property, value, check) {
    if (value && check) return { [property]: value }
  },

  injectInlineElements (content, inline) {
    let inc = 0
    for (const elem of inline) {
      const newContent = content.substring(0, elem.start + inc) + elem.html +
        content.substring(elem.end + inc)
      inc += elem.html.length - content.substring(elem.start + inc, elem.end + inc).length
      content = newContent
    }
    return content
  },

  getExtraVolume (elementType, stroke) {
    // svg icons always have the double stroke size
    if (elementType === 'icon') return Math.round((stroke.size || 0) * 2)
    switch (stroke.type) {
      case 'outside':
        return Math.round(stroke.size * 2)
      case 'center':
        return Math.round(stroke.size)
      default: // inside
        return 0
    }
  },

  async prepareProjectFolder (folder) {
    await File.syncUiFolder(folder)
    File.createFolder(folder, '_desech/cache')
  },

  unifyFiles (data) {
    if (ExtendJS.isEmpty(data._html)) return
    this.unifyFolderToFile(data)
    this.unifyFileToIndex(data)
    this.renameFirstFileToIndex(data)
  },

  unifyFolderToFile (data) {
    const keys = Object.keys(data._html)
    if (data._html[keys[0]].type === 'file' || keys.length > 1) return
    // the single folder becomes redundant, so use the files directly
    data._html = data._html[keys[0]].files
  },

  unifyFileToIndex (data) {
    const keys = Object.keys(data._html)
    if (keys.length > 1 || keys[0] === 'index') return
    this.convertToIndexFile(data, keys[0])
  },

  convertToIndexFile (data, name) {
    data._html.index = { ...data._html[name], name: 'index' }
    delete data._html[name]
  },

  renameFirstFileToIndex (data) {
    if (this.haveRootIndexFile(data._html)) return
    const keys = Object.keys(data._html)
    if (data._html[keys[0]].type === 'file') {
      this.convertToIndexFile(data, keys[0])
    } else {
      // folder
      this.convertFolderFileToIndex(data)
    }
  },

  convertFolderFileToIndex (data) {
    const folder = Object.keys(data._html)[0]
    const file = Object.keys(data._html[folder].files)[0]
    data._html.index = { ...data._html[folder].files[file], name: 'index' }
    delete data._html[folder].files[file]
  },

  haveRootIndexFile (html) {
    for (const file of Object.values(html)) {
      if (file.type === 'file' && file.name === 'index') return true
    }
    return false
  },

  mergeValues (array, glue) {
    if (!array.length) return {}
    const data = array[0]
    for (let i = 1; i < array.length; i++) {
      // we skip the 1st record
      for (const key of Object.keys(data)) {
        data[key] += glue + array[i][key]
      }
    }
    return data
  },

  getTextBackgroundCss () {
    return {
      color: 'transparent',
      'background-clip': 'text',
      '-webkit-background-clip': 'text'
    }
  },

  getImageUrl (file, folder) {
    const url = File.sanitizePath(file).replace(folder, '..')
    return `url("${url}")`
  },

  async processLocalImages (imagePath, ext, extra) {
    const id = this.getImageId(imagePath)
    const fileName = this.getImageName(extra.element.name, id, extra.processImages)
    const src = File.resolve(extra.importFolder, imagePath)
    const dest1x = await this.copyResizeImages(src, extra.projectFolder, fileName, ext,
      extra.data)
    return this.getImageUrl(dest1x, extra.projectFolder)
  },

  getImageId (imagePath) {
    const fileName = File.basename(imagePath)
    return (fileName.indexOf('.') > 0) ? fileName.substring(0, fileName.indexOf('.')) : fileName
  },

  getImageName (string, id, imageList) {
    let name = this.sanitizeName(string)
    if (imageList[name] || ['background', 'image', 'arrow-down'].includes(name)) {
      name += '-' + this.sanitizeName(id)
    }
    imageList[name] = true
    return name
  },

  getSvgName (node, images) {
    let name = this.sanitizeName(node.name)
    if (images[name]) name += '-' + node.width + '-' + node.height
    if (images[name]) name += '-' + this.sanitizeName(node.id)
    images[name] = true
    return name
  },

  async copyResizeImages (src, projectFolder, fileName, ext, data) {
    const dest1x = await this.copyResizeImage(src, projectFolder, fileName, ext, data.width)
    await this.copyResizeImage(src, projectFolder, fileName + '@2x', ext, data.width * 2)
    await this.copyResizeImage(src, projectFolder, fileName + '@3x', ext, data.width * 3)
    return dest1x
  },

  async copyResizeImage (src, projectFolder, name, ext, width) {
    const dest = File.resolve(projectFolder, 'asset/image/' + name + '.' + ext)
    if (fs.existsSync(dest)) return dest
    const image = await jimp.read(src)
    await image.resize(width, jimp.AUTO)
    await image.writeAsync(dest)
    return dest
  }
}
