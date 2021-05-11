import SketchCommon from './SketchCommon.js'

export default {
  getSvgContent (element, width, height, type) {
    if (type !== 'icon') return
    const tags = this.getSvgTags(element)
    const content = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">` +
      tags + '</svg>'
    return { content }
  },

  getSvgTags (element, offset = null) {
    const data = this.getSvgData(element, offset)
    if (element._class === 'shapeGroup') {
      return this.getSvgShapeGroupPath(element, data)
    } else {
      // shapePath, triangle, polygon, star, rectangle, oval
      return this.getSvgShapePath(element, data)
    }
  },

  getSvgData (element, offset) {
    if (offset === null) {
      return {
        offset: this.getOffset(element.style.borders),
        attributes: '',
        x: 0,
        y: 0
      }
    } else {
      return {
        offset,
        attributes: this.getAttributes(element.style),
        x: element.frame.x,
        y: element.frame.y
      }
    }
  },

  getOffset (borders) {
    return (borders && borders.length > 0 && borders[0].thickness)
      ? parseInt(borders[0].thickness)
      : 0
  },

  getAttributes (style) {
    const data = this.getAttributesData(style)
    let attr = ''
    for (const [name, val] of Object.entries(data)) {
      attr += ` ${name}="${val}"`
    }
    return attr.trim()
  },

  getAttributesData (style) {
    return {
      // we don't want fill=none
      ...SketchCommon.getIconFill(style.fills, false),
      ...SketchCommon.getIconStroke(style.borders)
    }
  },

  getSvgShapeGroupPath (element, data) {
    let tags = ''
    for (const layer of element.layers) {
      tags += this.getSvgTags(layer, data.offset)
    }
    return tags
  },

  getSvgShapePath (element, data) {
    const points = this.getShapePathPoints(element, data)
    return `<path d="${points}"${data.attributes}/>`
  },

  getShapePathPoints (element, data) {
    const points = []
    const origin = this.parsePoint(element, element.points[0].point, data.offset)
    points.push(`M${data.x + origin.x} ${data.y + origin.y}`)
    for (const item of element.points.slice(1)) {
      const point = this.getShapePathPoint(element, item, data)
      points.push(point)
    }
    if (element.isClosed) points.push('Z')
    return points.join(' ')
  },

  getShapePathPoint (element, item, data) {
    const from = this.parsePoint(element, item.curveFrom, data.offset)
    const to = this.parsePoint(element, item.curveTo, data.offset)
    const point = this.parsePoint(element, item.point, data.offset)
    return (from.x === to.x && from.y === to.y)
      ? `L ${data.x + point.x} ${data.y + point.y}`
      : `S ${data.x + to.x} ${data.y + to.y}, ${data.x + point.x} ${data.y + point.y}`
  },

  parsePoint (element, point, offset) {
    // a point ca be {0.5, 0}
    const points = point.slice(1, -1).split(', ')
    const x = parseFloat((element.frame.width * parseFloat(points[0]) + offset).toFixed(3))
    const y = parseFloat((element.frame.height * parseFloat(points[1]) + offset).toFixed(3))
    return { x, y }
  }
}
