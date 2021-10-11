import fs from 'fs'
import { JSDOM } from 'jsdom'
import Cookie from '../../lib/Cookie.js'
import HelperElement from '../../../js/helper/HelperElement.js'
import HelperDOM from '../../../js/helper/HelperDOM.js'
import File from '../File.js'

export default {
  _document: null,
  _folder: null,

  parseHtml (document, folder) {
    this.init(document, folder)
    this.prepareElement(document.body)
    return {
      canvas: this.getBody(document) || null,
      meta: this.getMeta(document) || null
    }
  },

  init (document, folder) {
    this._document = document
    this._folder = folder
  },

  getBody (document) {
    if (document.styleSheets.length) {
      return document.body.outerHTML.trim().replace('<body', '<div').replace('</body>', '</div>')
    } else {
      return document.body.children[0]?.trim()
    }
  },

  getMeta (document) {
    if (document.styleSheets.length) {
      return {
        language: document.documentElement.lang,
        title: document.title,
        meta: document.head.innerHTML.replace(/<title([\s\S]*)/gi, '').trim()
      }
    }
  },

  prepareElement (node, componentChildren) {
    const tag = HelperDOM.getTag(node)
    const type = this.getTagElement(tag)
    if (tag === 'body') {
      this.setBody(node)
    } else if (type) {
      this.setBasic(node, type)
    } else if (tag === 'input') {
      this.setInputElement(node)
    } else if (tag === 'img') {
      this.setImageElement(node)
    } else if (tag === 'video' || tag === 'audio') {
      this.setMediaElement(node, tag)
    } else if (node.classList.contains('text')) {
      this.setTagElement(node, 'text', 'p')
    } else if (node.classList.contains('block')) {
      this.setTagElement(node, 'block', 'div', componentChildren)
    } else if (node.classList.contains('component')) {
      this.setComponent(node)
    } else if (node.classList.contains('component-children')) {
      this.setComponentChildren(node, componentChildren)
    } else if (this.isInlineElement(node)) {
      // inline check is done at the end
      this.setInlineElement(node)
    }
  },

  prepareChildren (children, componentChildren = null) {
    for (const node of children) {
      this.prepareElement(node, componentChildren)
    }
  },

  getTagElement (tag) {
    const map = {
      svg: 'icon',
      iframe: 'iframe',
      object: 'object',
      canvas: 'canvas',
      textarea: 'textarea',
      select: 'dropdown',
      datalist: 'datalist',
      progress: 'progress',
      meter: 'meter'
    }
    return map[tag] || null
  },

  setBody (body) {
    this.cleanAttributes(body)
    this.cleanClasses(body)
    body.classList.add('element')
    body.classList.add('body')
    // @todo this is temporary for older projects; remove it later
    if (!body.classList.contains('e000body')) body.classList.add('e000body')
    if (body.children.length) this.prepareChildren(body.children)
  },

  setComponent (node) {
    const file = File.resolve(this._folder, node.getAttributeNS(null, 'src'))
    if (!fs.existsSync(file)) return node.remove()
    node.classList.add(HelperElement.generateElementRef())
    this.addCanvasClasses(node, 'component')
    node.setAttributeNS(null, 'src', file)
    const componentChildren = node.innerHTML
    node.innerHTML = this.getHtmlFromFile(file)
    this.prepareChildren(node.children, componentChildren)
  },

  getHtmlFromFile (file) {
    return fs.readFileSync(file).toString()
  },

  setComponentChildren (node, componentChildren) {
    this.setBasic(node, 'component-children')
    if (componentChildren) node.innerHTML = componentChildren
    this.prepareChildren(node.children)
  },

  setBasic (node, type) {
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

  // also check RightHtmlCommon.getIgnoredAttributes()
  cleanAttributes (node) {
    for (const attr of node.attributes) {
      if (attr.name === 'hidden') {
        node.setAttributeNS(null, `data-ss-${attr.name}`, attr.value)
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
    if (this.isComponentElement(node)) {
      node.classList.add('component-element')
    }
    if (!['block', 'text', 'component', 'component-children'].includes(type)) {
      node.classList.add(type)
    }
  },

  isComponentElement (node) {
    if (node.parentNode.constructor.name === 'DocumentFragment' ||
      !node.parentNode.closest('.component')) {
      return false
    }
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

  setImageElement (node) {
    // only the folder needs to be encoded because the images are saved as encoded in the html
    const srcset = node.getAttributeNS(null, 'srcset')
      .replace(/(,)?( )?(.+?)( .x)/g, `$1$2${encodeURI(this._folder)}/$3$4`)
    node.setAttributeNS(null, 'srcset', srcset)
    this.setBasic(node, 'image')
  },

  setMediaElement (node, tag) {
    this.setBasic(node, tag)
    this.setTrackSource(node)
  },

  setTrackSource (node) {
    for (const child of node.children) {
      this.setAbsoluteSource(child)
    }
  },

  setInputElement (node) {
    if (['range', 'color', 'file'].includes(node.type)) {
      this.setBasic(node, node.type)
    } else if (node.type === 'checkbox' || node.type === 'radio') {
      this.setBasic(node, 'checkbox')
    } else {
      this.setBasic(node, 'input')
    }
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

  setInlineElement (node) {
    this.setBasic(node, 'inline')
    if (node.children.length) this.prepareChildren(node.children)
  },

  setTagElement (node, type, tag, componentChildren = null) {
    this.setBasic(node, type)
    node = this.changeNodeSpecialTag(node)
    const children = HelperDOM.getChildren(node)
    if (children) this.prepareChildren(children, componentChildren)
  },

  changeNodeSpecialTag (node) {
    const tag = HelperDOM.getTag(node)
    if (HelperElement.isNormalTag(tag)) return node
    node = HelperDOM.changeTag(node, 'div', this._document)
    node.setAttributeNS(null, 'data-ss-tag', tag)
    return node
  },

  async parseComponentFile (file) {
    const folder = await Cookie.getCookie('currentFolder')
    const html = fs.readFileSync(file).toString()
    const dom = new JSDOM(html)
    return this.parseHtml(dom.window.document, folder)
  }
}
