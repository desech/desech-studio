import fs from 'fs'
import { JSDOM } from 'jsdom'
import Cookie from '../../lib/Cookie.js'
import HelperElement from '../../../js/helper/HelperElement.js'
import HelperDOM from '../../../js/helper/HelperDOM.js'
import File from '../File.js'
import HelperComponent from '../../../js/helper/HelperComponent.js'
import HelperProject from '../../../js/helper/HelperProject.js'

export default {
  _document: null,
  _folder: null,
  _options: null,
  // change this when you want to debug
  _debug: false,

  parseHtml (document, file, folder, options) {
    this.debugMsg('\n\nParsing started')
    this.init(document, file, folder, options)
    const body = this.getBody(document.body)
    const componentData = this.extractComponentData(body)
    const componentLevel = options.newComponent ? 1 : 0
    if (body) this.prepareElement(body, componentLevel)
    return {
      canvas: this.returnBody(body) || null,
      meta: this.returnMeta() || null,
      component: componentData || null
    }
  },

  init (document, file, folder, options) {
    this._document = document
    this._file = file
    this._folder = folder
    this._options = options
  },

  getBody (body) {
    // components also have <body> but we don't want it
    return (this._options.isComponent || this._options.newComponent) ? body.children[0] : body
  },

  extractComponentData (body) {
    if (!this._options.isComponent || !body) return
    const data = body.dataset.ssComponent
    body.removeAttributeNS(null, 'data-ss-component')
    return data ? JSON.parse(data) : null
  },

  returnBody (body) {
    if (body) {
      return body.outerHTML.trim().replace('<body', '<div').replace('</body>', '</div>')
    }
  },

  returnMeta () {
    if (!this._options.isComponent && !this._options.newComponent) {
      return {
        language: this._document.documentElement.lang,
        title: this._document.title,
        meta: this._document.head.innerHTML.replace(/<title([\s\S]*)/gi, '').trim()
      }
    }
  },

  prepareElement (node, componentLevel = 0, componentChildren = null) {
    const tag = HelperDOM.getTag(node)
    const mappedTag = this.getMappedTag(tag)
    if (tag === 'body') {
      this.setBody(node)
    } else if (node.classList.contains('component')) {
      this.setComponent(node, componentLevel)
    } else if (mappedTag) {
      this.setBasic(node, mappedTag, componentLevel)
    } else if (tag === 'input') {
      this.setInputElement(node, componentLevel)
    } else if (tag === 'img') {
      this.setImageElement(node, componentLevel)
    } else if (tag === 'video' || tag === 'audio') {
      this.setMediaElement(node, tag, componentLevel)
    } else if (node.classList.contains('text')) {
      this.setTagElement(node, 'text', 'p', componentLevel)
    } else if (node.classList.contains('block')) {
      this.setTagElement(node, 'block', 'div', componentLevel, componentChildren)
    } else if (this.isInlineElement(node)) {
      // inline check is done at the end
      this.setInlineElement(node, componentLevel)
    }
  },

  prepareChildren (children, componentLevel, componentChildren = null) {
    for (const node of children) {
      this.prepareElement(node, componentLevel, componentChildren)
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

  setComponent (node, componentLevel) {
    const data = HelperComponent.getComponentInstanceData(node)
    data.file = File.resolve(this._folder, data.file)
    if (!fs.existsSync(data.file)) return node.remove()
    const html = this.getHtmlFromFile(data.file)
    const element = this._document.createRange().createContextualFragment(html).children[0]
    this.mergeComponentData(element, data)
    this.debugComponent(node, componentLevel)
    componentLevel = this.adjustComponentLevel('component', componentLevel)
    this.prepareElement(element, componentLevel, node.innerHTML)
    node.replaceWith(element)
  },

  /**
   * level 0 means that we are not inside a component
   * level 1 means that we just entered a component and we need the root element to not be a
   *    component-element
   * level 2 means that we are going through the component children
   * level 3 means that we are inside a component that is inside another component, which means
   *    that everything will be a component-element, including the component holes
   *
   * for components, we need to increase the level when we just entered one at level 0,
   *    or at level 2 where we are inside another component
   * for component holes, we reset the level back to 0 when we are inside a component
   * for regular elements, when we just entered the component we need to increase the level,
   *    so the root element is level 1 while the children are level 2
   */
  adjustComponentLevel (type, level) {
    switch (type) {
      case 'component':
        return (level === 0 || level === 2) ? level + 1 : level
      case 'component-hole':
        return (level === 2) ? 0 : level
      case 'element':
        return (level === 1) ? level + 1 : level
    }
  },

  addComponentClasses (node, componentLevel) {
    // level 0 and 1 are regular elements, while level 2 and 3 are component elements
    if ((componentLevel === 2 && !HelperComponent.isComponentHole(node)) || componentLevel > 2) {
      node.classList.add('component-element')
    }
    // we need unique refs for each component element to be able to select them
    // we also need it for the component root element and the hole when we are in a page
    // this happens when we parse existing components, or we add new components
    if (HelperComponent.isComponentElement(node) || HelperComponent.isComponent(node) ||
      (HelperProject.isFilePage(this._file) && HelperComponent.isComponentHole(node)) ||
      this._options.newComponent) {
      HelperDOM.prependClass(node, HelperElement.generateElementRef())
    }
    this.debugNode(node, componentLevel)
  },

  debugNode (node, componentLevel) {
    if (!this._debug) return
    const tab = (' ').repeat(componentLevel)
    const ref = HelperElement.getRef(node)
    if (HelperComponent.isComponent(node) && HelperComponent.isComponentHole(node)) {
      console.info(tab, 'component root and hole', ref, componentLevel)
    } else if (HelperComponent.isComponent(node)) {
      console.info(tab, 'component root', ref, componentLevel)
    } else if (HelperComponent.isComponentHole(node)) {
      console.info(tab, 'component hole', ref, componentLevel)
    } else { // element
      console.info(tab, HelperElement.getType(node), ref, componentLevel)
    }
  },

  debugComponent (node, componentLevel) {
    if (!this._debug) return
    const tab = (' ').repeat(componentLevel)
    const file = HelperComponent.getComponentInstanceFile(node).replace('.html', '')
    console.info(tab, file, componentLevel)
  },

  debugMsg (msg) {
    if (this._debug) console.info(msg)
  },

  getHtmlFromFile (file) {
    return fs.readFileSync(file).toString()
  },

  mergeComponentData (element, data) {
    data.main = element.dataset.ssComponent
    element.setAttributeNS(null, 'data-ss-component', JSON.stringify(data))
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

  setBasic (node, type, componentLevel) {
    if (!node.getAttributeNS(null, 'class')) {
      throw new Error(`Unknown ${type} element ${this.errorEscapeHtml(node.outerHTML)}`)
    }
    this.setAbsoluteSource(node)
    this.cleanAttributes(node)
    this.cleanClasses(node)
    this.addCanvasClasses(node, type)
    this.addComponentClasses(node, componentLevel)
  },

  addCanvasClasses (node, type) {
    node.classList.add('element')
    if (type !== 'block' && type !== 'text') {
      node.classList.add(type)
    }
  },

  setImageElement (node, componentLevel) {
    // only the folder needs to be encoded because the images are saved as encoded in the html
    const srcset = node.getAttributeNS(null, 'srcset')
      .replace(/(,)?( )?(.+?)( .x)/g, `$1$2${encodeURI(this._folder)}/$3$4`)
    node.setAttributeNS(null, 'srcset', srcset)
    this.setBasic(node, 'image', componentLevel)
  },

  setMediaElement (node, tag, componentLevel) {
    this.setBasic(node, tag, componentLevel)
    this.setTrackSource(node)
  },

  setTrackSource (node) {
    for (const child of node.children) {
      this.setAbsoluteSource(child)
    }
  },

  setInputElement (node, componentLevel) {
    if (['range', 'color', 'file'].includes(node.type)) {
      this.setBasic(node, node.type, componentLevel)
    } else if (node.type === 'checkbox' || node.type === 'radio') {
      this.setBasic(node, 'checkbox', componentLevel)
    } else {
      this.setBasic(node, 'input', componentLevel)
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

  setInlineElement (node, componentLevel) {
    this.setBasic(node, 'inline', componentLevel)
    if (node.children.length) this.prepareChildren(node.children, componentLevel)
  },

  setTagElement (node, type, tag, componentLevel, componentChildren = null) {
    this.setBasic(node, type, componentLevel)
    node = this.changeNodeSpecialTag(node)
    this.setElementChildren(node, componentLevel, componentChildren)
  },

  setElementChildren (node, componentLevel, componentChildren) {
    const children = HelperDOM.getChildren(node)
    if (children) {
      componentLevel = this.adjustComponentLevel('element', componentLevel)
      this.prepareChildren(children, componentLevel, componentChildren)
    } else if (componentChildren && HelperComponent.isComponentHole(node)) {
      node.innerHTML = componentChildren
      componentLevel = this.adjustComponentLevel('component-hole', componentLevel)
      this.prepareChildren(node.children, componentLevel)
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
    return this.parseHtml(dom.window.document, file, folder, { newComponent: true })
  }
}
