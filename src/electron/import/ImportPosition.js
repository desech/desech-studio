import HelperElement from '../../js/helper/HelperElement.js'
import ImportPositionCommon from './ImportPositionCommon.js'
import ExtendJS from '../../js/helper/ExtendJS.js'

export default {
  buildStructure (nodes, fonts) {
    this.cleanUnstyledBlocks(nodes)
    const body = this.getBody(fonts)
    this.positionNodes(nodes, body, body)
    ImportPositionCommon.debugEnd(nodes, body)
    return body
  },

  cleanUnstyledBlocks (nodes) {
    for (let i = nodes.length - 1; i >= 0; i--) {
      if (nodes[i].desechType === 'block' && ExtendJS.isEmpty(nodes[i].style)) {
        nodes.splice(i, 1)
      }
    }
  },

  getBody (fonts) {
    return {
      desechType: 'block',
      name: 'body',
      x: 0,
      y: 0,
      width: 99999999,
      height: 99999999,
      ref: HelperElement.generateElementRef(),
      style: {
        text: {
          // add the first font to the body
          fontFamily: fonts[0] ? fonts[0].name : undefined
        }
      },
      isContainer: true,
      children: []
    }
  },

  positionNodes (nodes, container, containerParent) {
    ImportPositionCommon.debugContainer(container)
    const traversal = this.getTraversal(nodes, container)
    ImportPositionCommon.debugTraversal(traversal)
    if (traversal.lines.length) this.convertToBlock(container)
    if (traversal.lines.length > 1) {
      this.positionContainerNode(nodes, container, traversal)
    } else if (traversal.lines.length === 1) {
      this.positionSingleNode(nodes, container, containerParent, traversal.elem)
    }
  },

  getTraversal (nodes, container) {
    // we skip the first line because we take the closest element
    const hData = this.getValidLines(nodes, container, 'y')
    const vData = this.getValidLines(nodes, container, 'x')
    return (vData.lines.length > hData.lines.length) ? vData : hData
  },

  getValidLines (nodes, container, type) {
    ImportPositionCommon.debugMsg(`Line ${type}`, 2)
    const data = { type, elem: null, lines: [] }
    for (const elem of nodes) {
      this.addValidLine(nodes, container, elem, type, data)
    }
    data.lines = ExtendJS.unique(data.lines.sort((a, b) => a - b))
    return data
  },

  addValidLine (nodes, container, elem, type, data) {
    ImportPositionCommon.debugLineNode(elem)
    if (!this.isLineValid(nodes, container, elem, type, data)) return
    ImportPositionCommon.debugLineAdd(elem, type)
    data.lines.push(ImportPositionCommon.getEnd(elem, type))
    // only used when running positionSingleNode()
    data.elem = elem
  },

  isLineValid (nodes, container, elem, type, data) {
    if (this.isLineOutside(elem, container, type)) return false
    for (const node of nodes) {
      if (this.isLineNodeInvalid(node, container, elem)) continue
      const clipping = this.isLineNodeClipping(node, container, elem, type, data)
      if (clipping) return false
    }
    return true
  },

  isLineOutside (elem, container, type) {
    if (ImportPositionCommon.isOutside(elem, container)) {
      // elem is outside container
      ImportPositionCommon.debugElemOutside(elem, container)
      return true
    } else if (ImportPositionCommon.getEnd(elem, type) >
      ImportPositionCommon.getEnd(container, type)) {
      // line is outside container
      ImportPositionCommon.debugMsg('Line is outside', 6)
      return true
    }
    return false
  },

  isLineNodeInvalid (node, container, elem) {
    if (node.ref === elem.ref) {
      return true
    } else if (ImportPositionCommon.isOutside(node, container)) {
      // node is outside of container
      ImportPositionCommon.debugLineNodeCheck(node, container, 'outside')
      return true
    } else if (ImportPositionCommon.isInsideChild(node, elem)) {
      // node is a child of elem
      ImportPositionCommon.debugLineNodeCheck(node, elem, 'inside child')
      return true
    }
    return false
  },

  isLineNodeClipping (node, container, elem, type, data) {
    if (ImportPositionCommon.isClipping(node, type, elem)) {
      ImportPositionCommon.debugLineNodeCheck(node, elem, 'clipping')
      return true
    }
    ImportPositionCommon.debugLineNodeCheck(node, elem, 'good')
    return false
  },

  convertToBlock (element) {
    if (element.desechType === 'block') return
    ImportPositionCommon.debugConvert(element)
    element.desechType = 'block'
  },

  positionContainerNode (nodes, container, traversal) {
    this.addContainerStyle(container, traversal)
    this.processLines(nodes, container, traversal)
  },

  addContainerStyle (container, traversal) {
    if (!container.style.layout) container.style.layout = {}
    const direction = (traversal.type === 'x') ? 'column' : 'row'
    container.style.layout.direction = direction
    const gridValue = this.getGridLines(container, traversal, direction)
    if (direction === 'column') {
      // only use the grid template for columns, not for rows
      container.style.layout.gridTemplateColumns = gridValue
    }
    // @todo take into account auto-layout gap and justify/align-content
    /*if (!container.style.layout.gap) */container.style.layout.gap = 0
    ImportPositionCommon.debugAddContainerStyle(container, direction, gridValue)
  },

  getGridLines (container, traversal, type) {
    let value = ''
    for (let i = 0; i < traversal.lines.length - 1; i++) {
      // skip the last line
      const line = traversal.lines[i]
      const size = traversal.lines[i - 1]
        ? line - traversal.lines[i - 1]
        : line - container[traversal.type]
      value += size + 'px '
    }
    // last element is auto
    return value.trim() + ' auto'
  },

  processLines (nodes, container, traversal) {
    for (let i = 0; i < traversal.lines.length; i++) {
      // we want the last cell too
      const block = this.getLineContainer(container, traversal, i)
      ImportPositionCommon.debugLineContainer(block)
      // add the container block
      container.children.push(block)
      this.positionNodes(nodes, block, container)
    }
  },

  getLineContainer (container, traversal, i) {
    return {
      name: 'container',
      x: (i && traversal.type === 'x') ? traversal.lines[i - 1] : container.x,
      y: (i && traversal.type === 'y') ? traversal.lines[i - 1] : container.y,
      width: this.getLineContainerWidth(container, traversal, i),
      height: this.getLineContainerHeight(container, traversal, i),
      type: 'block',
      ref: HelperElement.generateElementRef(),
      zIndex: 0,
      style: {},
      isContainer: true,
      children: []
    }
  },

  getLineContainerWidth (container, traversal, i) {
    const line = traversal.lines[i]
    if (line && traversal.type === 'x') {
      return (traversal.lines[i - 1]) ? line - traversal.lines[i - 1] : line - container.x
    } else {
      return container.width
    }
  },

  getLineContainerHeight (container, traversal, i) {
    const line = traversal.lines[i]
    if (line && traversal.type === 'y') {
      return (traversal.lines[i - 1]) ? line - traversal.lines[i - 1] : line - container.y
    } else {
      return container.height
    }
  },

  positionSingleNode (nodes, container, containerParent, elem) {
    this.moveSingleElement(nodes, container, containerParent, elem)
    // we only have 3 types: block, text and icon
    // if we find children inside icons convert them to block
    // later in Import.js we will set the icon svg as bg image
    if (elem.desechType === 'text') {
      ImportPositionCommon.debugMsg('Ignore children for text element', 2)
    } else {
      ImportPositionCommon.debugMsg(`Finding children for ${elem.desechType} element`, 2)
      this.positionNodes(nodes, elem, containerParent)
    }
  },

  moveSingleElement (nodes, container, containerParent, elem) {
    // no extra container is needed, we just move this element inside the container parent
    ImportPositionCommon.debugMoveToContainer(container, containerParent, elem)
    this.replaceContainerWithElement(elem, container, containerParent)
    this.removeElementFromNodes(elem, nodes)
    this.addElementMargin(elem, container)
  },

  replaceContainerWithElement (elem, container, containerParent) {
    if (containerParent.ref === container.ref || !container.isContainer) {
      container.children.push(elem)
      return
    }
    for (let i = 0; i < containerParent.children.length; i++) {
      if (containerParent.children[i].ref === container.ref) {
        containerParent.children[i] = elem
        return
      }
    }
  },

  removeElementFromNodes (elem, nodes) {
    for (let i = nodes.length - 1; i >= 0; i--) {
      if (nodes[i].ref === elem.ref) {
        return nodes.splice(i, 1)
      }
    }
  },

  addElementMargin (elem, container) {
    // use the relative container to fetch the x and y
    // @todo take into account auto-layout padding
    // @todo do negative margins for elements that don't fit inside
    const top = Math.round(elem.y - container.y)
    const left = Math.round(elem.x - container.x)
    const margin = {}
    if (top && !elem.style.text?.alignSelf) margin.top = top
    if (left) margin.left = left
    if (!ExtendJS.isEmpty(margin)) {
      if (!elem.style.layout) elem.style.layout = {}
      elem.style.layout.margin = margin
    }
  }
}
