import File from '../file/File.js'
import HelperStyle from '../../js/helper/HelperStyle.js'
import HelperColor from '../../js/helper/HelperColor.js'

export default {
  addCssFills (element, rules, params) {
    if (!element.style.fills) return
    if (element.desechType === 'text') {
      this.addCssFillsText(element.style.fills, rules)
    } else if (element.desechType === 'block') {
      this.addCssFillsBackground(element.style.fills, rules, params)
    }
  },

  addCssFillsText (fills, rules, params) {
    if (fills.length === 1 && fills[0].type === 'solid-color') {
      // black is the default color
      if (fills[0].color !== 'rgb(0, 0, 0)') rules.color = fills[0].color
    } else {
      rules.color = 'transparent'
      rules['background-clip'] = rules['-webkit-background-clip'] = 'text'
      this.addCssFillsBackground(fills, rules, params)
    }
  },

  addCssFillsBackground (fills, rules, params) {
    if (!fills.length) return
    for (const prop of this.getBgProperties()) {
      rules[prop] = ''
    }
    for (let i = 0; i < fills.length; i++) {
      if (i > 0) {
        for (const prop of this.getBgProperties()) {
          rules[prop] += ', '
        }
      }
      this.addCssFillsBlockFill(fills[i], rules, params)
    }
  },

  getBgProperties () {
    return [
      'background-image',
      'background-blend-mode',
      'background-size',
      'background-repeat',
      'background-position',
      'background-attachment',
      'background-origin'
    ]
  },

  addCssFillsBlockFill (fill, rules, params) {
    rules['background-image'] += this.getBackgroundImage(fill, params)
    rules['background-blend-mode'] += fill.blendMode ||
      HelperStyle.getDefaultProperty('background-size')
    rules['background-size'] += (fill.type === 'image')
      ? 'contain'
      : HelperStyle.getDefaultProperty('background-size')
    rules['background-repeat'] += (fill.type === 'image')
      ? 'no-repeat'
      : HelperStyle.getDefaultProperty('background-repeat')
    rules['background-position'] += HelperStyle.getDefaultProperty('background-position')
    rules['background-attachment'] += HelperStyle.getDefaultProperty('background-attachment')
    rules['background-origin'] += HelperStyle.getDefaultProperty('background-origin')
  },

  getBackgroundImage (fill, params) {
    if (fill.type === 'solid-color') {
      return HelperColor.getBackgroundSolidColor(fill.color)
    } else if (fill.type === 'linear-gradient') {
      const angle = this.getGradientLinearAngle(fill.angle.x1, fill.angle.x2, fill.angle.y1,
        fill.angle.y2)
      const stops = this.getGradientStops(fill.stops)
      return `linear-gradient(${angle}deg, ${stops})`
    } else if (fill.type === 'radial-gradient') {
      const stops = this.getGradientStops(fill.stops)
      return `radial-gradient(${stops})`
    } else if (fill.type === 'image') {
      return this.getImageUrl(fill.image, params)
    }
  },

  getGradientLinearAngle (x1, x2, y1, y2) {
    const radians = Math.atan((y2 - y1) / (x2 - x1) * -1)
    return parseInt(((180 * radians) / Math.PI).toFixed(1))
  },

  getGradientStops (stops) {
    const array = []
    for (const stop of stops) {
      const position = Math.round(stop.position * 100)
      array.push(`${stop.color} ${position > 100 ? 100 : position}%`)
    }
    return array.join(', ')
  },

  getImageUrl (file, params) {
    const url = File.sanitizePath(file).replace(params.folder, '..')
    return `url("${url}")`
  }
}
