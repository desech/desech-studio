import HelperStyle from './HelperStyle.js'
import HelperCrypto from './HelperCrypto.js'
import HelperCanvas from './HelperCanvas.js'
import HelperFile from './HelperFile.js'
import HelperDOM from './HelperDOM.js'

export default {
  generateElementRef () {
    return 'e0' + HelperCrypto.generateSmallHash()
  },

  getRef (element) {
    for (const name of element.classList) {
      // ui classes used are: element, block, selected, _ss_foo...
      if (name.startsWith('e0')) return name
    }
  },

  getElement (ref) {
    return document.getElementsByClassName(ref)[0]
  },

  getAttributes (element) {
    return element.attributes
  },

  getClasses (element, viewable = false) {
    const classes = []
    if (!element.classList) return classes
    for (const name of element.classList) {
      if (!HelperStyle.isSelectorClass(name)) continue
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

  getTypeByRef (ref) {
    const element = this.getElement(ref)
    return this.getType(element)
  },

  getKeyTypeMap () {
    return {
      v: 'select', // same as figma, sketch, xd
      r: 'block', // rectangle
      t: 'text',
      s: 'icon', // svg icon
      i: 'image',
      w: 'video',
      a: 'audio',
      n: 'input', // input text
      d: 'dropdown',
      x: 'textarea',
      c: 'checkbox', // input
      e: 'range', // input
      o: 'color', // input
      f: 'file', // input
      h: 'hand'
      // "g" is used by switching the overlays
    }
  },

  getKeys () {
    return Object.keys(this.getKeyTypeMap())
  },

  getTypes () {
    const general = Object.values(this.getKeyTypeMap())
    const special = ['inline', 'component', 'component-children']
    return general + special
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

  // is the element part of the ui (visible or not), not a hidden clone that is used for do/undo
  isCanvasElement (element) {
    return element && (!element.hasAttributeNS(null, 'hidden') ||
      element.hasAttributeNS(null, 'data-ss-hidden'))
  },

  isComponent (element) {
    return (this.getType(element) === 'component')
  },

  getComponentChildren (element) {
    return element.querySelector('.component-children:not(.component-element)')
  },

  getComponentName (element) {
    const file = element.getAttributeNS(null, 'src')
    const name = HelperFile.getBasename(file)
    return name.replace('.html', '')
  },

  isHidden (element) {
    return element.hasAttributeNS(null, 'data-ss-hidden')
  },

  isContainer (element) {
    return element.classList.contains('block')
  },

  isContainerChild (element) {
    return this.isContainer(element.parentNode)
  },

  hasSmallWidth (element) {
    const pos = this.getPosition(element)
    return pos.width <= 50
  },

  hasSmallHeight (element) {
    const pos = this.getPosition(element)
    return pos.height <= 40
  },

  getTag (node) {
    if (node.hasAttributeNS(null, 'data-ss-tag')) {
      return node.getAttributeNS(null, 'data-ss-tag').toLowerCase()
    } else {
      return HelperDOM.getTag(node)
    }
  },

  isNormalTag (tag) {
    return this.getNormalTags().includes(tag)
  },

  getNormalTags () {
    return ['div', 'p', 'button', 'a', 'main', 'article', 'section', 'nav', 'aside', 'header',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'footer', 'address', 'pre', 'blockquote', 'figure',
      'figcaption', 'hr', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'form', 'label', 'output']
  },

  isSpecialTag (tag) {
    return this.getSpecialTags().includes(tag)
  },

  getSpecialTags () {
    return ['template', 'slot', 'noscript']
  }
}
