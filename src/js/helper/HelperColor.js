export default {
  hsvToRgb (hue, saturation, value) {
    let r, g, b

    const i = Math.floor(hue * 6)
    const f = hue * 6 - i
    const p = value * (1 - saturation)
    const q = value * (1 - f * saturation)
    const t = value * (1 - (1 - f) * saturation)

    switch (i % 6) {
      case 0:
        r = value
        g = t
        b = p
        break
      case 1:
        r = q
        g = value
        b = p
        break
      case 2:
        r = p
        g = value
        b = t
        break
      case 3:
        r = p
        g = q
        b = value
        break
      case 4:
        r = t
        g = p
        b = value
        break
      case 5:
        r = value
        g = p
        b = q
        break
    }
    return [
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255)
    ]
  },

  rgbToHsv (r, g, b) {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const v = max
    const d = max - min
    const s = max === 0 ? 0 : d / max
    let h

    if (max === min) {
      h = 0
    } else {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }
    return [h, s, v]
  },

  hexToRgb (hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
      return r + r + g + g + b + b
    })

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null
  },

  rgbToHex (red, green, blue) {
    const rgb = blue | (green << 8) | (red << 16)
    return ((0x1000000 + rgb).toString(16).slice(1)).toUpperCase()
  },

  hslToRgb (h, s, l) {
    let r, g, b

    if (s === 0) {
      r = g = b = l
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q

      r = this.hueToRgb(p, q, h + 1 / 3)
      g = this.hueToRgb(p, q, h)
      b = this.hueToRgb(p, q, h - 1 / 3)
    }
    return [
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255)
    ]
  },

  hueToRgb (p, q, t) {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  },

  rgbToHsl (r, g, b) {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2
    let h, s

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }
    return [h, s, l]
  },

  validateHex (value) {
    return /^#([0-9A-F]{3}){1,2}$/i.test(value)
  },

  validateRgb (r, g, b) {
    return !(r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255)
  },

  validateHslHsv (h, s, lv) {
    return !(h < 0 || h > 360 || s < 0 || s > 100 || lv < 0 || lv > 100)
  },

  validateAlpha (value) {
    return !(value < 0 || value > 100)
  },

  extractRgb (css) {
    // rgb(255, 255, 255) or rgba(255, 255, 255, 0.7)
    return css.match(/[0-9.]+/gi)
  },

  rgbToCss (rgb, alpha) {
    if (alpha < 1) {
      return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`
    } else {
      return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
    }
  },

  isSolidColor (string) {
    return string.startsWith('rgb')
  },

  isGradient (string) {
    return (string.includes('linear-gradient(') || string.includes('radial-gradient('))
  },

  getBackgroundSolidColor (color) {
    return `linear-gradient(${color} 0%, ${color} 100%)`
  },

  getHexAlpha (alpha) {
    const y = Math.floor(alpha * 255)
    const value = y.toString(16).toUpperCase()
    return y < 16 ? '0' + value : value
  }
}
