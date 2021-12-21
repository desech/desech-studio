import HelperStyle from './HelperStyle.js'
import HelperCanvas from './HelperCanvas.js'
import HelperDOM from './HelperDOM.js'
import ExtendJS from './ExtendJS.js'
import Crypto from '../../electron/lib/Crypto.js'

export default {
  generateElementRef () {
    return 'e0' + Crypto.generateSmallID()
  },

  getAllRefs (element) {
    return this.getAllRefsByClass(element.classList)
  },

  getRef (element) {
    // when we have 2 or 3 refs, the first ref is used for positioning only
    const refs = this.getAllRefs(element)
    return refs[0]
  },

  getStyleRef (element) {
    // when we have 2 or 3 refs, the style is the last ref
    const refs = this.getAllRefs(element)
    return refs[refs.length - 1]
  },

  getComponentRef (element) {
    // when we have 3 refs, the middle ref is the component ref
    const refs = this.getAllRefs(element)
    return refs[1]
  },

  // 1st - positioning, 2nd - component ref, 3rd - style ref
  // elements have 1 ref (style ref)
  // component elements have 2 refs (position + style ref)
  // components have 3 refs (position ref, component ref, root element style ref)
  getAllRefsByClass (classList) {
    const refs = []
    for (const name of classList) {
      if (name.startsWith('e0')) refs.push(name)
    }
    return refs
  },

  getAllRefsObject (classList) {
    const refs = this.getAllRefsByClass(classList)
    switch (refs.length) {
      case 1:
        return {
          type: 'element',
          position: refs[0],
          style: refs[0]
        }
      case 2:
        return {
          type: 'component-element',
          position: refs[0],
          style: refs[1]
        }
      case 3:
        return {
          type: 'component',
          position: refs[0],
          component: refs[1],
          style: refs[2]
        }
    }
  },

  removePositionRef (element) {
    const refs = this.getAllRefs(element)
    if (refs.length > 1) {
      element.classList.remove(refs[0])
    }
  },

  replacePositionRef (element, newRef) {
    const currentRef = this.getRef(element)
    element.classList.replace(currentRef, newRef)
  },

  getElement (ref) {
    const canvas = HelperCanvas.getCanvas()
    const nodes = canvas.getElementsByClassName(ref)
    for (const node of nodes) {
      if (this.isCanvasElement(node)) return node
    }
    // sometimes we just need the element even if it's no part of the canvas
    if (nodes.length) return nodes[0]
  },

  // is the element part of the ui (visible or not), not a hidden clone that is used for do/undo
  isCanvasElement (node) {
    return node && !node.closest('[hidden]:not([data-ss-hidden])') &&
      (!node.hasAttributeNS(null, 'hidden') || node.hasAttributeNS(null, 'data-ss-hidden'))
  },

  getAttributes (element) {
    return element.attributes
  },

  getProperties (element) {
    const props = element.dataset.ssProperties
    return props ? JSON.parse(props) : null
  },

  setProperties (element, properties) {
    if (ExtendJS.isEmpty(properties)) {
      delete element.dataset.ssProperties
    } else {
      element.dataset.ssProperties = JSON.stringify(properties)
    }
  },

  getClasses (element, viewable = false) {
    const classes = []
    if (!element.classList) return classes
    for (const name of element.classList) {
      if (!HelperStyle.isCssComponentClass(name)) continue
      const label = viewable ? HelperStyle.getViewableClass(name) : name
      classes.push(label)
    }
    return classes
  },

  getType (element) {
    const types = this.getTypes()
    for (const name of element.classList) {
      if (types.includes(name)) {
        return name
      }
    }
    throw new Error('Unknown element type')
  },

  getKeys () {
    return Object.keys(this.getKeyTypeMap())
  },

  getElementByKey (type) {
    return this.getKeyTypeMap()[type]
  },

  getKeyTypeMap () {
    return {
      v: 'select', // same as figma, sketch, xd
      r: 'block', // rectangle
      t: 'text',
      s: 'icon', // svg icon
      i: 'image',
      n: 'input', // input text
      d: 'dropdown',
      x: 'textarea',
      c: 'checkbox', // input
      l: 'datalist',
      h: 'hand'
      // "g" is used by switching the overlays
      // "p" is used for preview
    }
  },

  getTypes () {
    return ['body', 'block', 'text', 'icon', 'image', 'video', 'audio', 'iframe', 'object',
      'canvas', 'input', 'dropdown', 'textarea', 'checkbox', 'datalist', 'range', 'color', 'file',
      'progress', 'meter', 'inline']
  },

  getPosition (element) {
    const container = this.getContainerPosition()
    // needed for svg elements
    const rect = element.getBoundingClientRect()
    const zoom = HelperCanvas.getZoomFactor()
    return {
      width: Math.round(rect.width * zoom),
      height: Math.round(rect.height * zoom),
      widthNoZoom: Math.round(rect.width),
      heightNoZoom: Math.round(rect.height),
      top: Math.round(rect.top * zoom),
      left: Math.round(rect.left * zoom),
      topWithScroll: Math.round(rect.top * zoom + container.scrollTop),
      leftWithScroll: Math.round(rect.left * zoom + container.scrollLeft),
      relativeTop: Math.round(rect.top * zoom + container.scrollTop - container.offsetTop),
      relativeLeft: Math.round(rect.left * zoom + container.scrollLeft - container.offsetLeft),
      container
    }
  },

  getContainerPosition () {
    const container = document.getElementsByClassName('canvas-container')[0]
    return {
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
      offsetLeft: container.offsetLeft,
      offsetTop: container.offsetTop
    }
  },

  isHidden (element) {
    return element.hasAttributeNS(null, 'data-ss-hidden')
  },

  isContainer (element) {
    return element.classList.contains('body') || element.classList.contains('block')
  },

  hasSmallWidth (element) {
    const pos = this.getPosition(element)
    return pos.width <= 50
  },

  hasSmallHeight (element) {
    const pos = this.getPosition(element)
    return pos.height <= 40
  },

  getTag (element) {
    if (this.getType(element) === 'body') {
      return 'body'
    } else if (element.hasAttributeNS(null, 'data-ss-tag')) {
      return element.getAttributeNS(null, 'data-ss-tag').toLowerCase()
    } else {
      return HelperDOM.getTag(element)
    }
  },

  isNormalTag (tag) {
    return this.getNormalTags().includes(tag)
  },

  getNormalTags () {
    //  elements, in chrome
    return ['div', 'p', 'button', 'a', 'main', 'article', 'section', 'nav', 'aside', 'header',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'footer', 'address', 'pre', 'blockquote', 'figure',
      'figcaption', 'hr', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'form', 'label', 'output',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption', 'colgroup', 'col',
      'map', 'area', 'fieldset', 'legend', 'details', 'summary']
  },

  isSpecialTag (tag) {
    return this.getSpecialTags().includes(tag)
  },

  getSpecialTags () {
    return ['template', 'slot', 'noscript']
  }
}
