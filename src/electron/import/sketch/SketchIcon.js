import ImportIcon from '../ImportIcon.js'

export default {
  addSvgContent (data, node) {
    if (data.desechType !== 'icon') return
    const nodeContent = this.getSvgNodeContent(data, node)
    const svgContent = ImportIcon.buildSvgContent(data, nodeContent)
    const viewBox = `0 0 ${data.width} ${data.height}`
    data.content = ImportIcon.getSvgCode(viewBox, svgContent)
  },

  getSvgNodeContent (data, node) {
    const points = this.getShapePathPoints(node)
    return `path d="${points}"`
  },

  getShapePathPoints (node) {
    const points = []
    const origin = this.parsePoint(node, node.points[0].point)
    points.push(`M${origin.x} ${origin.y}`)
    for (const item of node.points.slice(1)) {
      const point = this.getShapePathPoint(node, item)
      points.push(point)
    }
    if (node.isClosed) points.push('Z')
    return points.join(' ')
  },

  getShapePathPoint (node, item) {
    const from = this.parsePoint(node, item.curveFrom)
    const to = this.parsePoint(node, item.curveTo)
    const point = this.parsePoint(node, item.point)
    return (from.x === to.x && from.y === to.y)
      ? `L ${point.x} ${point.y}`
      : `S ${to.x} ${to.y}, ${point.x} ${point.y}`
  },

  parsePoint (node, point) {
    // a point ca be {0.5, 0}
    const points = point.slice(1, -1).split(', ')
    const x = parseFloat((node.frame.width * parseFloat(points[0])).toFixed(3))
    const y = parseFloat((node.frame.height * parseFloat(points[1])).toFixed(3))
    return { x, y }
  }
}
