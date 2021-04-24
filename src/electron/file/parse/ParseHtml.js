import os from 'os'
import fs from 'fs'
import { JSDOM } from 'jsdom'
import Cookie from '../../lib/Cookie.js'
import HelperElement from '../../../js/helper/HelperElement.js'
import HelperDOM from '../../../js/helper/HelperDOM.js'

export default {
  _document: null,
  _folder: null,
  _datalist: null,

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
    const datalist = document.createElement('div')
    this.init(document, folder, datalist)
    this.buildHtml(nodes)
    this.removeDatalists()
    return {
      canvas: nodes.length ? nodes[0].parentNode.innerHTML.trim() : '',
      meta: this.getMeta(),
      datalist: datalist.innerHTML.trim()
    }
  },

  init (document, folder, datalist) {
    this._document = document
    this._folder = folder
    this._datalist = datalist
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
    if (tag === 'svg') return this.addBasic(node, 'icon')
    if (tag === 'img') return this.buildImageElement(node)
    if (tag === 'video') return this.buildVideoElement(node)
    if (tag === 'audio') return this.buildAudioElement(node)
    if (tag === 'input') return this.addInputElement(node)
    if (tag === 'select') return this.addBasic(node, 'dropdown')
    if (tag === 'textarea') return this.addBasic(node, 'textarea')
    if (tag === 'datalist') return this.addDatalist(node)
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

  addComponent (node) {
    // we don't want path.resolve because of windows
    const file = this._folder + '/' + node.getAttributeNS(null, 'src')
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
    for (const attr of ['src', 'poster']) {
      // srcset is done separately
      if (node[attr]) {
        node[attr] = this._folder + '/' + node.getAttributeNS(null, attr)
      }
    }
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
    node.srcset = node.srcset.replace(/(,)?( )?(.+?)( .x)/g, `$1$2${this._folder}/$3$4`)
    this.addBasic(node, 'image')
  },

  buildVideoElement (node) {
    this.addBasic(node, 'video')
    this.setTrackSource(node)
  },

  setTrackSource (node) {
    for (const child of node.children) {
      this.setAbsoluteSource(child)
    }
  },

  buildAudioElement (node) {
    this.addBasic(node, 'audio')
    this.setTrackSource(node)
    this.buildAudioContainer(node)
  },

  buildAudioContainer (audio) {
    const div = this._document.createElement('div')
    this.transferAllAttributes(audio, div, ['src', 'controls', 'autoplay', 'loop', 'muted'])
    audio.parentNode.replaceChild(div, audio)
    div.appendChild(audio)
  },

  transferAllAttributes (from, to, skipDelete) {
    this.transferAttributes(from, to, skipDelete)
    this.transferData(from, to)
  },

  transferAttributes (from, to, skipDelete = true) {
    for (const attr of from.attributes) {
      to.setAttributeNS(null, attr.name, attr.value)
      if (skipDelete !== true && !skipDelete.includes(attr.name)) {
        // JSDOM doesn't use a live list
        from.removeAttributeNS(null, attr.name)
      }
    }
  },

  transferData (from, to) {
    for (const [key, val] of Object.entries(from.dataset)) {
      to.dataset[key] = val
      delete from.dataset[key]
    }
  },

  addInputElement (node) {
    if (['range', 'color', 'file'].includes(node.type)) {
      return this.addBasic(node, node.type)
    }
    if (node.type === 'checkbox' || node.type === 'radio') {
      return this.addBasic(node, 'checkbox')
    }
    this.cleanDatalist(node)
    this.addBasic(node, 'input')
  },

  cleanDatalist (node) {
    if (node.hasAttributeNS(null, 'list') && !node.list) node.removeAttributeNS(null, 'list')
  },

  addDatalist (node) {
    this._datalist.appendChild(node.cloneNode(true))
  },

  isInlineElement (node) {
    const regex = new RegExp(`^${this.getInlineTagRegex()}$`, 'gi')
    const tag = HelperDOM.getTag(node)
    return regex.test(tag)
  },

  getInlineTagRegex () {
    return '(b|i|a|span|strong|em|time|ins|del|s|mark|small|sub|sup|q|abbr|cite|dfn|samp|code' +
      '|var|kbd|bdo|ruby|rt|rb)'
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
    node = HelperDOM.changeTag(node, 'div')
    node.setAttributeNS(null, 'data-ss-tag', tag)
    return node
  },

  removeDatalists () {
    const nodes = this._document.getElementsByTagName('datalist')
    while (nodes.length > 0) {
      nodes[0].remove()
    }
  }
}
