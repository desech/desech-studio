import os from 'os'
import path from 'path'
import fs from 'fs'
import { JSDOM } from 'jsdom'
import HelperFile from '../../../js/helper/HelperFile.js'
import HelperElement from '../../../js/helper/HelperElement.js'
import Cookie from '../../lib/Cookie.js'
import HelperDOM from '../../../js/helper/HelperDOM.js'

export default {
  parseHtml (document, folder, componentProperties = null, componentElem = false) {
    const datalist = document.createElement('div')
    this.buildHtml(document.body.children, document, folder, datalist, componentProperties,
      componentElem)
    this.removeDatalists(document)
    return {
      canvas: document.body.innerHTML.trim(),
      meta: this.getMeta(document),
      datalist: datalist.innerHTML.trim()
    }
  },

  getMeta (document) {
    const meta = document.head.innerHTML.replace(/<title([\s\S]*)/gi, '').trim()
    return { title: document.title, meta }
  },

  buildHtml (nodes, document, folder, datalist, componentProperties = null,
    componentElem = false) {
    for (const node of nodes) {
      this.buildElement(node, document, folder, datalist, componentProperties, componentElem)
    }
  },

  buildElement (node, document, folder, datalist, componentProperties, componentElem) {
    const tag = HelperDOM.getTag(node)
    if (tag === 'svg') return this.addBasic(node, 'icon', componentElem)
    if (tag === 'img') return this.buildImageElement(node, folder, componentElem)
    if (tag === 'video') return this.buildVideoElement(node, componentElem)
    if (tag === 'audio') return this.buildAudioElement(node, document, componentElem)
    if (tag === 'input') return this.addInputElement(node, componentElem)
    if (tag === 'select') return this.addBasic(node, 'dropdown', componentElem)
    if (tag === 'textarea') return this.addBasic(node, 'textarea', componentElem)
    if (tag === 'datalist') return this.addDatalist(node, datalist)
    if (node.classList.contains('text')) {
      return this.buildTagElement(node, 'text', 'p', document, folder, datalist,
        componentProperties, componentElem)
    }
    if (node.classList.contains('block')) {
      return this.buildTagElement(node, 'block', 'div', document, folder, datalist,
        componentProperties, componentElem)
    }
    if (node.classList.contains('component')) {
      return this.addComponent(node, document, folder, datalist, componentProperties,
        componentElem)
    }
    if (node.classList.contains('component-children')) {
      return this.addBasic(node, 'component-children', componentElem)
    }
    // inline check is done at the end
    if (this.isInlineElement(node)) {
      return this.buildInlineElement(node, document, folder, datalist, componentProperties,
        componentElem)
    }
  },

  addComponent (node, document, folder, datalist, componentProperties, componentElem) {
    const file = path.resolve(folder, node.getAttributeNS(null, 'src'))
    if (!fs.existsSync(file)) return node.remove()
    const dom = new JSDOM(this.getHtmlFromFile(file))
    const isMainComponent = (componentProperties === null)
    if (!componentProperties) componentProperties = []
    const properties = JSON.stringify(node.dataset)
    if (properties !== '{}' || isMainComponent) componentProperties.unshift(node.dataset)
    const html = this.parseHtml(dom.window.document, folder, componentProperties, true)
    const div = this.buildComponentDiv(html, file, dom.window.document, datalist,
      properties, JSON.stringify(componentProperties), isMainComponent, componentElem)
    const nodeHtml = node.innerHTML
    node.replaceWith(div)
    this.addComponentChildren(div, nodeHtml, document, folder, datalist)
  },

  getHtmlFromFile (file) {
    const html = fs.readFileSync(file).toString()
    return html.indexOf('<body>') > 1 ? html : `<body>${html}</body`
  },

  buildComponentDiv (html, file, document, datalist, properties, allProperties,
    isMainComponent, componentElem) {
    const div = document.createElement('div')
    div.className = 'element component ' + HelperElement.generateElementRef()
    if (componentElem) div.className += ' component-element'
    div.setAttributeNS(null, 'src', file)
    if (properties !== '{}') div.setAttributeNS(null, 'data-properties', properties)
    if (isMainComponent && allProperties !== '[]') {
      div.setAttributeNS(null, 'data-all-properties', allProperties)
    }
    this.addComponentHtml(div, html, datalist)
    return div
  },

  addComponentHtml (div, html, datalist) {
    div.insertAdjacentHTML('afterbegin', html.canvas)
    if (html.datalist) datalist.insertAdjacentHTML('beforeend', html.datalist)
  },

  addComponentChildren (div, nodeHtml, document, folder, datalist) {
    const childrenContainer = HelperElement.getComponentChildren(div)
    if (!nodeHtml || !childrenContainer) return
    childrenContainer.insertAdjacentHTML('afterbegin', nodeHtml)
    this.buildHtml(childrenContainer.children, document, folder, datalist)
  },

  addBasic (node, type, componentElem = false) {
    if (!node.getAttributeNS(null, 'class')) {
      throw new Error(`Unknown ${type} element ${this.errorEscapeHtml(node.outerHTML)}`)
    }
    this.setAbsoluteSource(node)
    this.cleanAttributes(node)
    this.cleanClasses(node)
    this.addCanvasClasses(node, type, componentElem)
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
      if (add.includes(attr.name)) node.setAttributeNS(null, `data-ss-${attr.name}`, attr.value)
      // JSDOM doesn't use a live list
      if (remove.includes(attr.name)) node.removeAttributeNS(null, attr.name)
    }
  },

  setAbsoluteSource (node) {
    for (const attr of ['src', 'poster']) {
      // srcset is done separately
      if (node[attr]) this.setAbsoluteSourceAttr(node, attr)
    }
  },

  setAbsoluteSourceAttr (node, attr) {
    node[attr] = HelperFile.getSourceFile(node[attr], os.platform())
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

  addCanvasClasses (node, type, componentElem) {
    node.classList.add('element')
    if (componentElem) node.classList.add('component-element')
    if (!['block', 'text', 'component-children'].includes(type)) {
      node.classList.add(type)
    }
  },

  buildImageElement (node, folder, componentElem) {
    node.srcset = node.srcset.replace(/(,)?( )?(.+?)( .x)/g, `$1$2${folder}/$3$4`)
    this.addBasic(node, 'image', componentElem)
  },

  buildVideoElement (node, componentElem) {
    this.addBasic(node, 'video', componentElem)
    this.setTrackSource(node)
  },

  setTrackSource (node) {
    for (const child of node.children) {
      this.setAbsoluteSource(child)
    }
  },

  buildAudioElement (node, document, componentElem) {
    this.addBasic(node, 'audio', componentElem)
    this.setTrackSource(node)
    this.buildAudioContainer(node, document)
  },

  buildAudioContainer (audio, document) {
    const div = document.createElement('div')
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

  addInputElement (node, componentElem) {
    if (['range', 'color', 'file'].includes(node.type)) {
      return this.addBasic(node, node.type, componentElem)
    }
    if (node.type === 'checkbox' || node.type === 'radio') {
      return this.addBasic(node, 'checkbox', componentElem)
    }
    this.cleanDatalist(node)
    this.addBasic(node, 'input', componentElem)
  },

  cleanDatalist (node) {
    if (node.hasAttributeNS(null, 'list') && !node.list) node.removeAttributeNS(null, 'list')
  },

  addDatalist (node, datalist) {
    datalist.appendChild(node.cloneNode(true))
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

  buildInlineElement (node, document, folder, datalist, componentProperties, componentElem) {
    this.addBasic(node, 'inline', componentElem)
    if (node.children.length) {
      this.buildHtml(node.children, document, folder, datalist, componentProperties,
        componentElem)
    }
  },

  buildTagElement (node, type, tag, document, folder, datalist, componentProperties,
    componentElem) {
    this.addBasic(node, type, componentElem)
    if (node.children.length) {
      this.buildHtml(node.children, document, folder, datalist, componentProperties,
        componentElem)
    }
  },

  removeDatalists (document) {
    const nodes = document.getElementsByTagName('datalist')
    while (nodes.length > 0) {
      nodes[0].remove()
    }
  },

  async parseComponentFile (file) {
    const folder = await Cookie.getCookie('currentFolder')
    const dom = new JSDOM(fs.readFileSync(file).toString())
    const html = this.parseHtml(dom.window.document, folder)
    return html
  }
}
