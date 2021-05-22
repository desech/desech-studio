import fs from 'fs'
import { JSDOM } from 'jsdom'
import Cookie from '../../lib/Cookie.js'
import HelperElement from '../../../js/helper/HelperElement.js'
import HelperDOM from '../../../js/helper/HelperDOM.js'
import File from '../File.js'

export default {
  _document: null,
  _folder: null,

  async parseComponentFile (file) {
    const folder = await Cookie.getCookie('currentFolder')
    // the purpose of the wrapping div is to properly add component-element
    const html = '<div class="component">' + fs.readFileSync(file).toString() + '</div>'
    const dom = new JSDOM(html)
    const nodes = dom.window.document.body.children[0].children
    return this.parseHtml(dom.window.document, folder, nodes)
  },

  parseHtml (document, folder, nodes = null) {
    if (!nodes) nodes = document.body.children
    this.init(document, folder)
    this.buildHtml(nodes)
    return {
      canvas: nodes.length ? nodes[0].parentNode.innerHTML.trim() : '',
      meta: this.getMeta()
    }
  },

  init (document, folder) {
    this._document = document
    this._folder = folder
  },

  getMeta () {
    if (!this._document.head) return
    const meta = this._document.head.innerHTML.replace(/<title([\s\S]*)/gi, '').trim()
    return {
      language: this._document.documentElement.lang,
      title: this._document.title,
      meta
    }
  },

  buildHtml (nodes, componentChildren = null) {
    for (const node of nodes) {
      this.buildElement(node, componentChildren)
    }
  },

  buildElement (node, componentChildren) {
    const tag = HelperDOM.getTag(node)
    const elemName = this.getTagElement(tag)
    if (elemName) return this.addBasic(node, elemName)
    if (tag === 'input') return this.addInputElement(node)
    if (tag === 'img') return this.buildImageElement(node)
    if (tag === 'video' || tag === 'audio') {
      return this.buildMediaElement(node, tag)
    }
    if (node.classList.contains('text')) {
      return this.buildTagElement(node, 'text', 'p')
    }
    if (node.classList.contains('block')) {
      return this.buildTagElement(node, 'block', 'div', componentChildren)
    }
    if (node.classList.contains('component')) {
      return this.addComponent(node)
    }
    if (node.classList.contains('component-children')) {
      return this.addComponentChildren(node, componentChildren)
    }
    // inline check is done at the end
    if (this.isInlineElement(node)) {
      return this.buildInlineElement(node)
    }
  },

  getTagElement (tag) {
    const map = {
      svg: 'icon',
      iframe: 'iframe',
      object: 'object',
      textarea: 'textarea',
      select: 'dropdown',
      datalist: 'datalist',
      progress: 'progress',
      meter: 'meter'
    }
    return map[tag] || null
  },

  addComponent (node) {
    const file = File.resolve(this._folder, node.getAttributeNS(null, 'src'))
    if (!fs.existsSync(file)) return node.remove()
    node.classList.add(HelperElement.generateElementRef())
    this.addCanvasClasses(node, 'component')
    node.setAttributeNS(null, 'src', file)
    const componentChildren = node.innerHTML
    node.innerHTML = this.getHtmlFromFile(file)
    this.buildHtml(node.children, componentChildren)
  },

  getHtmlFromFile (file) {
    const html = fs.readFileSync(file).toString()
    return html.indexOf('<body>') > 1 ? html : `<body>${html}</body`
  },

  addComponentChildren (node, componentChildren) {
    this.addBasic(node, 'component-children')
    if (componentChildren) node.innerHTML = componentChildren
    this.buildHtml(node.children)
  },

  addBasic (node, type) {
    if (!node.getAttributeNS(null, 'class')) {
      throw new Error(`Unknown ${type} element ${this.errorEscapeHtml(node.outerHTML)}`)
    }
    this.setAbsoluteSource(node)
    this.cleanAttributes(node)
    this.cleanClasses(node)
    this.addCanvasClasses(node, type)
  },

  errorEscapeHtml (text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }
    return text.replace(/[&<>"']/g, m => map[m])
  },

  cleanAttributes (node) {
    // check RightHtmlCommon.js for details
    const add = ['hidden', 'controls', 'disabled']
    const remove = ['disabled']
    for (const attr of node.attributes) {
      if (add.includes(attr.name)) {
        node.setAttributeNS(null, `data-ss-${attr.name}`, attr.value)
      }
      // JSDOM doesn't use a live list
      if (remove.includes(attr.name)) {
        node.removeAttributeNS(null, attr.name)
      }
    }
  },

  setAbsoluteSource (node) {
    const tag = HelperDOM.getTag(node)
    if (tag !== 'iframe' && node.src) node.src = this.getAbsPath(node, 'src')
    if (node.poster) node.poster = this.getAbsPath(node, 'poster')
    if (tag === 'object' && node.data) node.data = this.getAbsPath(node, 'data')
  },

  getAbsPath (node, attr) {
    return File.resolve(this._folder, node.getAttributeNS(null, attr))
  },

  cleanClasses (node) {
    const classes = []
    for (const cls of node.classList) {
      if (this.isStandardClass(cls)) {
        classes.push(cls)
      } else {
        classes.push('_ss_' + cls)
      }
    }
    node.setAttributeNS(null, 'class', classes.join(' '))
  },

  isStandardClass (cls) {
    return (cls === 'block' || cls === 'text' || cls === 'component-children' ||
      cls.startsWith('e0'))
  },

  addCanvasClasses (node, type) {
    node.classList.add('element')
    if (this.isComponentElement(node)) node.classList.add('component-element')
    if (!['block', 'text', 'component', 'component-children'].includes(type)) {
      node.classList.add(type)
    }
  },

  isComponentElement (node) {
    if (node.parentNode.constructor.name === 'DocumentFragment') return false
    if (!node.parentNode.closest('.component')) return false
    if (node.classList.contains('component-children')) {
      return this.getTotalParents(node, 'component') !==
      this.getTotalParents(node, 'component-children')
    } else {
      return this.getTotalParents(node.parentNode, 'component') !==
        this.getTotalParents(node.parentNode, 'component-children')
    }
  },

  getTotalParents (node, cls) {
    let elem = node
    let count = 0
    while (elem = elem.closest('.' + cls)) { // eslint-disable-line
      count++
      elem = elem.parentNode
      if (!elem) return count
    }
    return count
  },

  buildImageElement (node) {
    const srcset = node.getAttributeNS(null, 'srcset')
      .replace(/(,)?( )?(.+?)( .x)/g, `$1$2${this._folder}/$3$4`)
    node.setAttributeNS(null, 'srcset', srcset)
    this.addBasic(node, 'image')
  },

  buildMediaElement (node, tag) {
    this.addBasic(node, tag)
    this.setTrackSource(node)
  },

  setTrackSource (node) {
    for (const child of node.children) {
      this.setAbsoluteSource(child)
    }
  },

  addInputElement (node) {
    if (['range', 'color', 'file'].includes(node.type)) {
      return this.addBasic(node, node.type)
    }
    if (node.type === 'checkbox' || node.type === 'radio') {
      return this.addBasic(node, 'checkbox')
    }
    this.addBasic(node, 'input')
  },

  isInlineElement (node) {
    const regex = new RegExp(`^${this.getInlineTagRegex()}$`, 'gi')
    const tag = HelperDOM.getTag(node)
    return regex.test(tag)
  },

  getInlineTagRegex () {
    return '(b|i|a|span|strong|em|time|ins|u|del|s|mark|small|sub|sup|q|abbr|' +
      'cite|dfn|samp|data|code|var|kbd|bdo|bdi|ruby|rt|rb)'
  },

  buildInlineElement (node) {
    this.addBasic(node, 'inline')
    if (node.children.length) {
      this.buildHtml(node.children)
    }
  },

  buildTagElement (node, type, tag, componentChildren = null) {
    this.addBasic(node, type)
    node = this.changeNodeSpecialTag(node)
    const children = HelperDOM.getChildren(node)
    if (children) this.buildHtml(children, componentChildren)
  },

  changeNodeSpecialTag (node) {
    const tag = HelperDOM.getTag(node)
    if (HelperElement.isNormalTag(tag)) return node
    node = HelperDOM.changeTag(node, 'div', this._document)
    node.setAttributeNS(null, 'data-ss-tag', tag)
    return node
  }
}
