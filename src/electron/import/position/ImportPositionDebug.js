import ImportPositionCommon from './ImportPositionCommon.js'

export default {
  _messages: [],

  start () {
    this._messages = []
  },

  getMessages () {
    return this._messages
  },

  addMsg (...args) {
    this._messages.push(args.join(' '))
  },

  debugMsg (text, spaces) {
    if (spaces) {
      this.addMsg(' '.padStart(spaces) + text)
    } else {
      this.addMsg(text)
    }
  },

  debugContainer (container) {
    this.addMsg('------------------------------------------------------------')
    this.addMsg('Container', container.name, container.ref, 'Position x1',
      container.x, 'y1', container.y, 'x2', ImportPositionCommon.getEnd(container, 'x'), 'y2',
      ImportPositionCommon.getEnd(container, 'y'))
  },

  debugLineNode (elem) {
    this.addMsg('   ', elem.name, elem.ref, 'Position x1', elem.x, 'y1', elem.y, 'x2',
      ImportPositionCommon.getEnd(elem, 'x'), 'y2', ImportPositionCommon.getEnd(elem, 'y'))
  },

  debugElemOutside (elem, container) {
    const boundaries = ImportPositionCommon.isOutsideBoundaries(elem, container)
    const intersect = ImportPositionCommon.getIntersectionParent(elem, container)
    this.addMsg('      Element is outside, Boundaries', boundaries, 'Intersect', intersect)
  },

  debugLineNodeCheck (node, elem, status) {
    const boundaries = (status === 'outside')
      ? ImportPositionCommon.isOutsideBoundaries(node, elem)
      : ImportPositionCommon.isInsideChildBoundaries(node, elem)
    const intersect = ImportPositionCommon.getIntersectionParent(node, elem)
    this.addMsg('     ', node.name, node.ref, 'Position x1', node.x, 'y1', node.y, 'x2',
      ImportPositionCommon.getEnd(node, 'x'), 'y2', ImportPositionCommon.getEnd(node, 'y'),
      'Status', status, 'Boundaries', boundaries, 'Intersect', intersect)
  },

  debugLineAdd (elem, type) {
    this.addMsg('      Adding to line', type, ImportPositionCommon.getEnd(elem, type))
  },

  debugTraversal (traversal) {
    if (traversal.lines.length > 1) {
      this.addMsg('  Traversal parent node', traversal.type, traversal.lines)
    } else if (traversal.lines.length === 1) {
      this.addMsg('  Traversal single node', traversal.elem.name, traversal.elem.ref)
    } else {
      this.addMsg('  No Traversal')
    }
  },

  debugAddContainerStyle (container, style) {
    this.addMsg('  Adding style to container', container.name, container.ref,
      JSON.stringify(style))
  },

  debugLineContainer (container) {
    this.addMsg('------------------------------------------------------------')
    this.addMsg('Adding container', container.name, container.ref, 'to its parent')
    this.addMsg('Processing line container', 'Position x', container.x, 'y', container.y,
      'width', container.width, 'height', container.height)
  },

  debugMoveToContainer (container, containerParent, elem) {
    const block = container.isContainer ? containerParent : container
    this.addMsg('  Moving element', elem.name, elem.ref, 'inside', block.name, block.ref)
  },

  debugConvert (elem) {
    this.addMsg(`  Convert ${elem.desechType} to block`, elem.name, elem.ref)
  },

  debugIgnoreStart (elements) {
    this.addMsg('------------------------------------------------------------')
    this.addMsg('Position ignored elements', elements.length)
  },

  debugIgnoreNode (element) {
    this.addMsg('  Ignored element', element.name, element.ref)
  },

  debugIgnoreContainer (container) {
    this.addMsg('    Found container', container.name, container.ref)
  }
}
