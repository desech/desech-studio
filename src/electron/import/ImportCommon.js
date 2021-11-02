import ExtendJS from '../../js/helper/ExtendJS.js'
import HelperColor from '../../js/helper/HelperColor.js'
import Crypto from '../lib/Crypto.js'

export default {
  getName (string, obj = null) {
    let name = this.sanitizeName(string)
    if (obj && obj[name]) name += '-' + Crypto.generateSmallID()
    return name
  },

  sanitizeName (name) {
    return name.toLowerCase().replace(/([^a-z0-9])/g, '-').replace(/-+/g, '-')
  },

  getImageFill (element) {
    if (!element.style.fills) return
    for (const fill of element.style.fills) {
      if (fill.type === 'image') return fill
    }
  },

  getExtraVolume (desechType, stroke) {
    if (!stroke) return 0
    // svg icons always have the double stroke size
    if (desechType === 'icon') return Math.round((stroke.size || 0) * 2)
    switch (stroke.type) {
      case 'outside':
        return Math.round(stroke.size * 2)
      case 'center':
        return Math.round(stroke.size)
      default: // inside
        return 0
    }
  },

  returnSize (value, desechType) {
    // we make sure each icon has at least 2px in width/height
    return (desechType === 'icon' && !value) ? 2 : value
  },

  injectInlineElements (content, inline) {
    let inc = 0
    for (const elem of inline) {
      const newContent = content.substring(0, elem.start + inc) + elem.html +
        content.substring(elem.end + inc)
      inc += elem.html.length - content.substring(elem.start + inc, elem.end + inc).length
      content = newContent
    }
    return content.replace(/\n/g, '\n<br>')
  },

  getColor (rgb, alpha) {
    alpha = ExtendJS.roundToTwo(alpha)
    return HelperColor.rgbToCss(rgb, alpha)
  },

  removeUndefined (obj) {
    for (const name in obj) {
      if (!obj[name]) delete obj[name]
    }
    return obj
  }
}
