import HelperElement from '../../js/helper/HelperElement.js'
import ImportPositionCommon from './position/ImportPositionCommon.js'
import ExtendJS from '../../js/helper/ExtendJS.js'

export default {
  _BIG: 99999999,

  buildStructure (nodes, bodyRef, css) {
    this.cleanNodes(nodes, css)
    const body = this.getBody(bodyRef)
    this.adjustBodyCss(css, bodyRef)
    this.positionNodes(nodes, css, body, body)
    ImportPositionCommon.debugEnd(nodes, css, body)
    return body
  },

  // remove the blocks that only have width and height
  cleanNodes (nodes, css) {
    for (let i = nodes.length - 1; i >= 0; i--) {
      if (nodes[i].type === 'block' && !this.hasExtraCss(css.element[nodes[i].ref])) {
        nodes.splice(i, 1)
      }
    }
  },

  hasExtraCss (props) {
    for (const prop of Object.keys(props)) {
      if (!['width', 'height', 'min-height'].includes(prop)) return true
    }
    return false
  },

  getBody (ref) {
    return {
      name: 'body',
      x: 0,
      y: 0,
      width: this._BIG,
      height: this._BIG,
      type: 'block',
      tag: null,
      ref,
      zIndex: 0,
      component: [],
      content: '',
      href: null,
      isContainer: true,
      children: []
    }
  },

  adjustBodyCss (css, ref) {
    delete css.element[ref].width
    // use the first font in body and remove it everywhere else
    // if (css.font[0]) css.element[ref]['font-family'] = css.font[0]

    // we prefer to let the body height adjust itself
    // css.element[ref].height = '100%'
  },

  positionNodes (nodes, css, container, containerParent) {
    ImportPositionCommon.debugContainer(container)
    const traversal = this.getTraversal(nodes, container)
    ImportPositionCommon.debugTraversal(traversal)
    if (traversal.lines.length) this.convertToBlock(container)
    if (traversal.lines.length > 1) {
      this.positionContainerNode(nodes, css, container, traversal)
    } else if (traversal.lines.length === 1) {
      this.positionSingleNode(nodes, css, container, containerParent, traversal.elem)
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
    if (element.type === 'block') return
    ImportPositionCommon.debugConvert(element)
    element.type = 'block'
  },

  positionContainerNode (nodes, css, container, traversal) {
    this.addContainerCss(css, container, traversal)
    this.processLines(nodes, css, container, traversal)
  },

  addContainerCss (css, container, traversal) {
    const gridType = (traversal.type === 'x') ? 'column' : 'row'
    const gridValue = this.getGridLines(container, traversal, gridType)
    css.element[container.ref] = css.element[container.ref] || {}
    if (gridType === 'column') {
      // only use the grid template for columns, not for rows
      css.element[container.ref][`grid-template-${gridType}s`] = gridValue
    }
    // css.element[container.ref][`${gridType}-gap`] = '0px'
    ImportPositionCommon.debugAddContainerCss(container, gridType, gridValue)
  },

  getGridLines (container, traversal, type) {
    let css = ''
    for (let i = 0; i < traversal.lines.length - 1; i++) {
      // skip the last line
      // const line = traversal.lines[i]
      // const size = traversal.lines[i - 1] ? line - traversal.lines[i - 1]
      //   : line - container[traversal.type]
      // we prefer to let the sizes adjust themselves
      // css += size + 'px '
      css += 'auto '
    }
    // last element is auto
    return css.trim() + ' auto'
  },

  processLines (nodes, css, container, traversal) {
    for (let i = 0; i < traversal.lines.length; i++) {
      // we want the last cell too
      const block = this.getLineContainer(container, traversal, i)
      ImportPositionCommon.debugLineContainer(block)
      // add the container block
      container.children.push(block)
      this.positionNodes(nodes, css, block, container)
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
      tag: null,
      component: [],
      content: '',
      href: null,
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

  positionSingleNode (nodes, css, container, containerParent, elem) {
    this.moveSingleElement(nodes, css, container, containerParent, elem)
    // we only have 3 types: block, text and icon
    // if we find children inside icons convert them to block
    // later in Import.js we will set the icon svg as bg image
    if (elem.type === 'text') {
      ImportPositionCommon.debugMsg('Ignore children for text element', 2)
    } else {
      ImportPositionCommon.debugMsg(`Finding children for ${elem.type} element`, 2)
      this.positionNodes(nodes, css, elem, containerParent)
    }
  },

  moveSingleElement (nodes, css, container, containerParent, elem) {
    // no extra container is needed, we just move this element inside the container parent
    ImportPositionCommon.debugMoveToContainer(container, containerParent, elem)
    this.replaceContainerWithElement(elem, container, containerParent)
    this.removeElementFromNodes(elem, nodes)
    // we prefer to manually add margins in desech
    // this.addElementMargin(css, elem, container)
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
  }

  // addElementMargin (css, elem, container) {
  //   // use the relative container to fetch the x and y
  //   if (!css.element[elem.ref]) throw new Error(`No css for element ${elem.ref}`)
  //   const marginTop = Math.round(elem.y - container.y)
  //   const marginLeft = Math.round(elem.x - container.x)
  //   if (marginTop && !css.element[elem.ref]['align-self']) {
  //     css.element[elem.ref]['margin-top'] = marginTop + 'px'
  //   }
  //   if (marginLeft) {
  //     css.element[elem.ref]['margin-left'] = marginLeft + 'px'
  //   }
  // }
}
