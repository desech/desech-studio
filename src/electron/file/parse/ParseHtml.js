import fs from 'fs'
import { JSDOM } from 'jsdom'
import Cookie from '../../lib/Cookie.js'
import HelperElement from '../../../js/helper/HelperElement.js'
import HelperDOM from '../../../js/helper/HelperDOM.js'
import File from '../File.js'
import HelperComponent from '../../../js/helper/HelperComponent.js'

export default {
  _document: null,
  _folder: null,
  _options: null,

  parseHtml (document, folder, options) {
    this.init(document, folder, options)
    const componentData = this.prepareComponentData()
    this.prepareElement(document.body)
    return {
      canvas: this.getBody() || null,
      meta: this.getMeta() || null,
      component: componentData || null
    }
  },

  init (document, folder, options) {
    this._document = document
    this._folder = folder
    this._options = options
  },

  prepareComponentData () {
    if (!this._options.isComponent) return
    const root = this._document.body.children[0]
    if (!root) return
    const data = root.dataset.ssComponent
    root.removeAttributeNS(null, 'data-ss-component')
    return data ? JSON.parse(data) : null
  },

  getBody () {
    const body = this._document.body
    if (this._options.isComponent || this._options.newComponent) {
      return body.children.length ? body.children[0].outerHTML.trim() : null
    } else { // page
      return body.outerHTML.trim().replace('<body', '<div').replace('</body>', '</div>')
    }
  },

  getMeta () {
    if (this._options.isComponent || this._options.newComponent) return
    return {
      language: this._document.documentElement.lang,
      title: this._document.title,
      meta: this._document.head.innerHTML.replace(/<title([\s\S]*)/gi, '').trim()
    }
  },

  prepareElement (node, componentChildren = null) {
    const tag = HelperDOM.getTag(node)
    const mappedTag = this.getMappedTag(tag)
    if (tag === 'body') {
      this.setBody(node)
    } else if (node.classList.contains('component')) {
      this.setComponent(node)
    } else if (mappedTag) {
      this.setBasic(node, mappedTag)
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

  getMappedTag (tag) {
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
    const data = HelperComponent.getComponentInstanceData(node)
    data.file = File.resolve(this._folder, data.file)
    if (!fs.existsSync(data.file)) return node.remove()
    const html = this.getHtmlFromFile(data.file)
    const element = this._document.createRange().createContextualFragment(html).children[0]
    this.mergeComponentData(element, data)
    this.prepareElement(element, node.innerHTML)
    node.replaceWith(element)
  },

  getHtmlFromFile (file) {
    return fs.readFileSync(file).toString()
  },

  mergeComponentData (element, data) {
    data.main = element.dataset.ssComponent
    element.setAttributeNS(null, 'data-ss-component', JSON.stringify(data))
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

  // check StateHtmlFile.cleanAttributes(), RightHtmlCommon.getIgnoredAttributes()
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
    return (cls === 'block' || cls === 'text' || cls.startsWith('e0'))
  },

  addCanvasClasses (node, type) {
    node.classList.add('element')
    if (type !== 'block' && type !== 'text') {
      node.classList.add(type)
    }
    // we need unique refs for each component element to be able to select them
    // this happens when we parse existing components inside the page, or we add new components
    if (node.closest('[data-ss-component]') || this._options.newComponent) {
      HelperDOM.prependClass(node, HelperElement.generateElementRef())
    }
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
    this.setElementChildren(node, componentChildren)
  },

  setElementChildren (node, componentChildren) {
    const children = HelperDOM.getChildren(node)
    if (children) {
      this.prepareChildren(children, componentChildren)
    } else if (componentChildren && HelperComponent.isComponentHole(node)) {
      node.innerHTML = componentChildren
      this.prepareChildren(node.children)
    }
  },

  changeNodeSpecialTag (node) {
    const tag = HelperDOM.getTag(node)
    if (HelperElement.isNormalTag(tag)) return node
    node = HelperDOM.changeTag(node, 'div', this._document)
    node.setAttributeNS(null, 'data-ss-tag', tag)
    return node
  },

  // this is called when we add a component to the canvas
  async parseComponentFile (file) {
    const folder = await Cookie.getCookie('currentFolder')
    const html = fs.readFileSync(file).toString()
    const dom = new JSDOM(html)
    return this.parseHtml(dom.window.document, folder, { newComponent: true })
  }
}
