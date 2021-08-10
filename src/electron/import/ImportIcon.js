import fs from 'fs'
import HelperCrypto from '../../js/helper/HelperCrypto.js'

export default {
  buildSvgNode (data, content) {
    
  },

  getGradientId () {
    return 'fill-' + HelperCrypto.generateSmallHash()
  },

  getFillUrl (data) {
    return data ? ` fill="url(#${data.id})"` : ''
  },

  getGradientNode (data, id) {
    const type = (data.type === 'linear-gradient') ? 'Linear' : 'Radial'
    return '<defs>\n' +
      `<${type}Gradient id="${id}" ${this.getGradientCoords(data.coords)}>\n` +
        this.getGradientStops(data.stops) +
      `</${type}Gradient>\n` +
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

  getPatternNode (data, id) {
    const ext = File.extname(data.image)
    const base64 = fs.readFileSync(data.image).toString('base64')
    return '<defs>\n' +
      `<pattern id="${id}" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"` +
        ` viewBox="0 0 ${data.width} ${data.height}">\n` +
        `<image width="${data.width}" height="${data.height}"` +
          ` xlink:href="data:image/${ext};base64,${base64}"/>\n` +
      '</pattern>\n' +
    '</defs>'
  }
}
