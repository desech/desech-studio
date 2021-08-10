import ImportIcon from '../ImportIcon.js'

export default {
  async addSvgContent (data, node, settings) {
    if (data.desechType !== 'icon') return
    const content = this.getSvgNodeContent(node)
    data.content = ImportIcon.buildSvgNode(data, content)
  },

  getSvgNodeContent (node) {
    if (node.shape?.type === 'polygon') {
      const points = this.getPolygonPoints(node.shape.points)
      return `polygon points="${points}"`
    } else { // path, compound
      return `path d="${node.shape.path}"`
    }
  },

  getPolygonPoints (points) {
    // shape['uxdesign#cornerRadius'] and shape ['uxdesign#starRatio'] are ignored
    const array = []
    for (const point of points) {
      array.push(Math.round(point.x) + ',' + Math.round(point.y))
    }
    return array.join(' ')
  }
}
