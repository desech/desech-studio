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

  getExtraVolume (desechType, stroke) {
    if (!stroke) return
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
  }
}
