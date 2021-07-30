import HelperCrypto from '../../js/helper/HelperCrypto.js'

export default {
  getGradientId () {
    return 'fill-' + HelperCrypto.generateSmallHash()
  },

  getGradientNode (data) {
    if (!data) return ''
    return '<defs>\n' +
      `<${data.type}Gradient id="${data.id}" ${this.getGradientCoords(data.coords)}>\n` +
        this.getGradientStops(data.stops) +
      `</${data.type}Gradient>\n` +
    '</defs>'
  },

  getGradientCoords (coords) {
    const attrs = []
    for (const [name, value] of Object.entries(coords)) {
      attrs.push(`${name}="${value}"`)
    }
    return attrs.join(' ')
  },

  getGradientStops (stops) {
    let svg = ''
    for (const stop of stops) {
      svg += `<stop offset="${stop.offset}" stop-color="${stop.color}"/>\n`
    }
    return svg
  },

  getPatternNode (data) {
    if (!data) return ''
    return '<defs>\n' +
      `<pattern id="${data.id}" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"` +
        ` viewBox="0 0 ${data.width} ${data.height}">\n` +
        `<image width="${data.width}" height="${data.height}"` +
          ` xlink:href="data:image/${data.image.ext};base64,${data.image.base64}"/>\n` +
      '</pattern>\n' +
    '</defs>'
  },

  getFillUrl (data) {
    return data ? ` fill="url(#${data.id})"` : ''
  }
}
