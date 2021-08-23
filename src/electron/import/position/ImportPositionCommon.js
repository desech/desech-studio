export default {
  getEnd (elem, type) {
    return (type === 'x') ? elem.x + elem.width : elem.y + elem.height
  },

  isOutside (node, container) {
    const iParent = this.getIntersectionParent(node, container)
    const outside = this.isOutsideBoundaries(node, container)
    return (iParent !== container.ref || (!iParent && outside))
  },

  isOutsideBoundaries (node, container) {
    const nodeX2 = node.x + node.width
    const nodeY2 = node.y + node.height
    const containerX2 = container.x + container.width
    const containerY2 = container.y + container.height
    return (node.x < container.x || node.x > containerX2 || node.y < container.y ||
      node.y > containerY2 || nodeX2 > containerX2 || nodeY2 > containerY2)
  },

  getIntersectionParent (node1, node2) {
    const intersect = this.getIntersectionArea(node1, node2)
    const i1 = intersect * 100 / (node1.width * node1.height)
    const i2 = intersect * 100 / (node2.width * node2.height)
    if (!i1 && !i2) {
      // no intersection
      return null
    } else if (i1 < 50 && i2 < 50) {
      // siblings that intersect a bit
      return 'siblings'
    } else if (i1 < i2) {
      // parent
      return node1.ref
    } else if (i2 < i1) {
      // parent
      return node2.ref
    } else if (node1.zIndex < node2.zIndex) {
      // parent
      return node1.ref
    } else if (node2.zIndex < node1.zIndex) {
      // parent
      return node2.ref
    } else {
      // i1 == i2 and z1 == z2
      // zIndexes are equal if both are generated parent blocks
      return node1.ref
    }
  },

  getIntersectionArea (node1, node2) {
    const node1X2 = node1.x + node1.width
    const node2X2 = node2.x + node2.width
    const node1Y2 = node1.y + node1.height
    const node2Y2 = node2.y + node2.height
    return Math.max(0, Math.min(node2X2, node1X2) - Math.max(node2.x, node1.x)) *
      Math.max(0, Math.min(node2Y2, node1Y2) - Math.max(node2.y, node1.y))
  },

  isInsideChild (node, container) {
    const iParent = this.getIntersectionParent(node, container)
    const inside = this.isInsideChildBoundaries(node, container)
    return (iParent === container.ref || (!iParent && inside))
  },

  isInsideChildBoundaries (node, container) {
    const inside = this.isInsideBoundaries(node, container)
    if (!inside) return false
    const areaNode = node.width * node.height
    const areaContainer = container.width * container.height
    return (container.desechType === 'block' && areaContainer >= areaNode &&
      container.zIndex < node.zIndex)
  },

  isInsideBoundaries (node, container) {
    const nodeX2 = node.x + node.width
    const nodeY2 = node.y + node.height
    const containerX2 = container.x + container.width
    const containerY2 = container.y + container.height
    return (node.x >= container.x && node.y >= container.y && nodeX2 <= containerX2 &&
      nodeY2 <= containerY2)
  },

  isClipping (node, type, elem) {
    const iParent = this.getIntersectionParent(node, elem)
    const clipping = this.isClippingBoundaries(node, type, elem)
    return ((iParent && iParent !== 'siblings') || (!iParent && clipping))
  },

  isClippingBoundaries (node, type, elem) {
    const elemEnd = this.getEnd(elem, type)
    const nodeEnd = this.getEnd(node, type)
    return (node[type] < elemEnd && nodeEnd > elemEnd)
  },

  isNodeTopLeftInsideBoundaries (node, container) {
    const containerX2 = container.x + container.width
    const containerY2 = container.y + container.height
    return (node.x >= container.x && node.y >= container.y && node.x <= containerX2 &&
      node.y <= containerY2)
  }
}
