import fs from 'fs'
import File from '../file/File.js'
import HelperCrypto from '../../js/helper/HelperCrypto.js'

export default {
  getSvgCode (viewBox, content) {
    return `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">\n` +
      content +
    '</svg>'
  },

  buildSvgContent (data, nodeContent) {
    const nodes = []
    const nodeId = 'node-' + HelperCrypto.generateSmallHash()
    const fillAttr = this.processFills(data.style.fills, nodes, nodeId)
    const strokeAttr = this.processStroke(data.style.stroke, nodes, nodeId)
    // move it in front so it's the first svg child
    nodes.unshift(`<${nodeContent} id="${nodeId}" ${fillAttr} ${strokeAttr}/>`)
    // effects will be added by css
    return nodes.join('\n')
  },

  processFills (fills, nodes, nodeId) {
    if (!fills) return 'fill="none"'
    // if there's only 1 fill, then return the attribute for the main node
    if (fills.length === 1) return this.processOneFill(fills[0], nodes, nodeId)
    for (const fill of fills) {
      const val = this.getSvgFillStroke(fill, 'fill', nodeId)
      nodes.push(val.def)
      nodes.push(val.use)
    }
    return ''
  },

  processOneFill (fill, nodes, nodeId) {
    const val = this.getSvgFillStroke(fill, 'fill', nodeId)
    if (val.def) nodes.push(val.def)
    return val.attr
  },

  processStroke (stroke, nodes, nodeId) {
    // because we can't have multiple strokes in css, we only have one stroke,
    // although svg does support multiple strokes
    if (!stroke) return 'stroke="none"'
    const val = this.getSvgFillStroke(stroke, 'stroke', nodeId)
    if (val.def) nodes.push(val.def)
    return `${val.attr} stroke-width="${stroke.size}" ${this.getStrokeDash(stroke)}`
  },

  getStrokeDash (stroke) {
    return (!stroke.dash?.length || stroke.dash.join(' ') === '0')
      ? ''
      : `stroke-dasharray="${stroke.dash.join(' ')}"`
  },

  getSvgFillStroke (val, type, nodeId) {
    switch (val.type) {
      case 'solid-color':
        return this.getSvgColor(val, type, nodeId)
      case 'linear-gradient': case 'radial-gradient':
        return this.getSvgGradient(val, type, nodeId)
      case 'image':
        return this.getSvgImage(val, type, nodeId)
    }
  },

  getSvgColor (val, type, nodeId) {
    return {
      use: `<use ${type}="${val.color}" href="#${nodeId}"/>`,
      attr: `${type}="${val.color}"`
    }
  },

  getSvgGradient (val, type, nodeId) {
    const gradientId = 'gradient-' + HelperCrypto.generateSmallHash()
    return {
      def: this.getGradientNode(val, gradientId),
      use: `<use ${type}="url(#${gradientId})" href="#${nodeId}"/>`,
      attr: `${type}="url(#${gradientId})"`
    }
  },

  getGradientNode (val, gradientId) {
    const type = (val.type === 'linear-gradient') ? 'linear' : 'radial'
    return '<defs>\n' +
      `<${type}Gradient id="${gradientId}" ${this.getGradientCoords(val.coords)}>\n` +
        this.getGradientStops(val.stops) + '\n' +
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
    const array = []
    for (const stop of stops) {
      const val = `<stop offset="${stop.position}" stop-color="${stop.color}"/>`
      array.push(val)
    }
    return array.join('\n')
  },

  getSvgImage (val, type, nodeId) {
    const imageId = 'image-' + HelperCrypto.generateSmallHash()
    const opacity = (val.opacity && val.opacity < 1) ? `${type}-opacity="${val.opacity}"` : ''
    return {
      def: this.getImageNode(val, imageId),
      use: `<use ${type}="url(#${imageId})" ${opacity} href="#${nodeId}"/>`,
      attr: `${type}="url(#${imageId})" ${opacity}`
    }
  },

  getImageNode (val, imageId) {
    const ext = File.extname(val.image, true)
    const base64 = fs.readFileSync(val.image).toString('base64')
    return '<defs>\n' +
      `<pattern id="${imageId}" preserveAspectRatio="xMidYMid slice" width="100%" ` +
        `height="100%" viewBox="0 0 ${val.width} ${val.height}">\n` +
        `<image width="${val.width}" height="${val.height}"` +
          ` href="data:image/${ext};base64,${base64}"/>\n` +
      '</pattern>\n' +
    '</defs>'
  }
}
