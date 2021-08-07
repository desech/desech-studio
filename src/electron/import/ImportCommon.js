import HelperCrypto from '../../js/helper/HelperCrypto.js'

export default {
  getName (string, obj = null) {
    let name = this.sanitizeName(string)
    if (obj && obj[name]) name += '-' + HelperCrypto.generateSmallHash()
    return name
  },

  sanitizeName (name) {
    return name.toLowerCase().replace(/([^a-z0-9])/g, '-').replace(/-+/g, '-')
  },

  getImageName (string, id, images) {
    let name = this.sanitizeName(string)
    if (images[name] || ['background', 'image', 'arrow-down'].includes(name)) {
      name += '-' + this.sanitizeName(id)
    }
    images[name] = true
    return name
  },

  getSvgName (node, images) {
    let name = this.sanitizeName(node.name)
    if (images[name]) name += '-' + node.width + '-' + node.height
    if (images[name]) name += '-' + this.sanitizeName(node.id)
    images[name] = true
    return name
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

  injectInlineElements (content, inline) {
    let inc = 0
    for (const elem of inline) {
      const newContent = content.substring(0, elem.start + inc) + elem.html +
        content.substring(elem.end + inc)
      inc += elem.html.length - content.substring(elem.start + inc, elem.end + inc).length
      content = newContent
    }
    return content.replace(/\n/g, '\n<br>')
  }
}
