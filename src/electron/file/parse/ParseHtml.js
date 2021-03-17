import os from 'os'
import path from 'path'
import fs from 'fs'
import { JSDOM } from 'jsdom'
import HelperFile from '../../../js/helper/HelperFile.js'
import HelperElement from '../../../js/helper/HelperElement.js'
import Cookie from '../../lib/Cookie.js'
import HelperDOM from '../../../js/helper/HelperDOM.js'

export default {
  parseHtml (document, folder, componentProperties = null) {
    const datalist = document.createElement('div')
    this.buildHtml(document.body.children, document, folder, datalist, componentProperties)
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

  buildHtml (nodes, document, folder, datalist, componentProperties = null) {
    for (const node of nodes) {
      this.buildElement(node, document, folder, datalist, componentProperties)
    }
  },

  buildElement (node, document, folder, datalist, componentProperties) {
    const tag = HelperDOM.getTag(node)
    if (tag === 'script') {
      return this.addComponent(node, document, folder, datalist, componentProperties)
    }
    if (tag === 'svg') return this.addBasic(node, 'icon')
    if (tag === 'img') return this.buildImageElement(node, folder)
    if (tag === 'video') return this.buildVideoElement(node)
    if (tag === 'audio') return this.buildAudioElement(node, document)
    if (tag === 'input') return this.addInputElement(node)
    if (tag === 'select') return this.addBasic(node, 'dropdown')
    if (tag === 'textarea') return this.addBasic(node, 'textarea')
    if (tag === 'datalist') return this.addDatalist(node, datalist)
    if (node.classList.contains('text')) {
      return this.buildTagElement(node, 'text', 'p', document, folder, datalist,
        componentProperties)
    }
    if (node.classList.contains('block')) {
      return this.buildTagElement(node, 'block', 'div', document, folder, datalist,
        componentProperties)
    }
    if (node.classList.contains('component-children')) {
      return this.addBasic(node, 'component-children')
    }
    // inline check is done at the end
    if (this.isInlineElement(node)) {
      return this.buildInlineElement(node, document, folder, datalist, componentProperties)
    }
  },

  addComponent (node, document, folder, datalist, componentProperties) {
    // we don't use node.src because we don't want the file:/// path
    const file = path.resolve(folder, node.getAttributeNS(null, 'src'))
    if (!fs.existsSync(file)) return node.remove()
    const dom = new JSDOM(fs.readFileSync(file).toString())
    const isMainComponent = (componentProperties === null)
    if (!componentProperties) componentProperties = []
    const properties = JSON.stringify(node.dataset)
    if (properties !== '{}' || isMainComponent) componentProperties.unshift(node.dataset)
    const html = this.parseHtml(dom.window.document, folder, componentProperties)
    const div = this.buildComponentDiv(html, file, dom.window.document, datalist,
      properties, JSON.stringify(componentProperties), isMainComponent)
    const nodeHtml = node.innerHTML
    node.replaceWith(div)
    this.addComponentChildren(div, nodeHtml, document, folder, datalist)
  },

  buildComponentDiv (html, file, document, datalist, properties, allProperties,
    isMainComponent) {
    const div = document.createElement('div')
    div.className = 'element component ' + HelperElement.generateElementRef()
    div.setAttributeNS(null, 'data-file', file)
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

  addCanvasClasses (node, type) {
    node.classList.add('element')
    if (!['block', 'text', 'component-children'].includes(type)) {
      node.classList.add(type)
    }
  },

  buildImageElement (node, folder) {
    node.srcset = node.srcset.replace(/(,)?( )?(.+?)( .x)/g, `$1$2${folder}/$3$4`)
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

  buildAudioElement (node, document) {
    this.addBasic(node, 'audio')
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

  addInputElement (node) {
    if (['range', 'color', 'file'].includes(node.type)) return this.addBasic(node, node.type)
    if (node.type === 'checkbox' || node.type === 'radio') return this.addBasic(node, 'checkbox')
    this.cleanDatalist(node)
    this.addBasic(node, 'input')
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

  buildInlineElement (node, document, folder, datalist, componentProperties) {
    this.addBasic(node, 'inline')
    if (node.children.length) {
      this.buildHtml(node.children, document, folder, datalist, componentProperties)
    }
  },

  buildTagElement (node, type, tag, document, folder, datalist, componentProperties) {
    this.addBasic(node, type)
    if (node.children.length) {
      this.buildHtml(node.children, document, folder, datalist, componentProperties)
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
