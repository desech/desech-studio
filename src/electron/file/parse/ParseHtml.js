import fs from 'fs'
import { JSDOM } from 'jsdom'
import Cookie from '../../lib/Cookie.js'
import HelperElement from '../../../js/helper/HelperElement.js'
import HelperDOM from '../../../js/helper/HelperDOM.js'
import File from '../File.js'
import HelperComponent from '../../../js/helper/HelperComponent.js'
import HelperFile from '../../../js/helper/HelperFile.js'

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
    const component = {
      data: this.extractComponentData(body),
      level: options.newComponent ? 1 : 0
    }
    if (body) this.prepareElement(body, component)
    return {
      canvas: this.returnBody(body) || null,
      meta: this.returnMeta() || null,
      component: component.data || null
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

  prepareElement (node, component) {
    const tag = HelperDOM.getTag(node)
    const mappedTag = this.getMappedTag(tag)
    const ref = HelperElement.getRef(node)
    if (tag === 'body') {
      this.setBody(node)
    } else if (node.classList.contains('component')) {
      this.setComponent(node, component)
    } else if (mappedTag) {
      this.setBasic(node, mappedTag, component)
    } else if (tag === 'input') {
      this.setInputElement(node, component)
    } else if (tag === 'select' || tag === 'datalist') {
      this.setDropdownElement(node, tag, component, ref)
    } else if (tag === 'svg') {
      this.setIconElement(node, component, ref)
    } else if (tag === 'img') {
      this.setImageElement(node, component)
    } else if (tag === 'video' || tag === 'audio') {
      this.setMediaElement(node, tag, component, ref)
    } else if (node.classList.contains('text')) {
      this.setTextElement(node, component, ref)
    } else if (node.classList.contains('block')) {
      this.setTagElement(node, 'block', 'div', component)
    } else if (this.isInlineElement(node)) {
      // inline check is done at the end
      this.setInlineElement(node, component)
    }
  },

  prepareChildren (children, component) {
    for (const node of children) {
      this.prepareElement(node, component)
    }
  },

  getMappedTag (tag) {
    const map = {
      iframe: 'iframe',
      object: 'object',
      canvas: 'canvas',
      textarea: 'textarea',
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
    if (body.children.length) this.prepareChildren(body.children, null)
  },

  setComponent (node, component) {
    const data = HelperComponent.getComponentData(node)
    data.file = File.resolve(this._folder, data.file)
    if (!fs.existsSync(data.file)) return node.remove()
    const html = this.getHtmlFromFile(data.file)
    const element = this._document.createRange().createContextualFragment(html).children[0]
    this.mergeComponentData(element, data)
    this.debugComponent(node, component)
    const children = node.innerHTML
    // we need the replace before the prepare because the tag change will overwrite the node
    node.replaceWith(element)
    const level = this.adjustComponentLevel('component', component?.level)
    this.prepareElement(element, { data, level, children })
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
    if (!level) level = 0
    switch (type) {
      case 'component':
        return (level === 0 || level === 2) ? level + 1 : level
      case 'component-hole':
        return (level === 2) ? 0 : level
      case 'element':
        return (level === 1) ? level + 1 : level
    }
  },

  addComponentClasses (node, component) {
    // level 0 and 1 are regular elements, while level 2 and 3 are component elements
    if ((component?.level === 2 && !HelperComponent.isComponentHole(node)) ||
      component?.level > 2) {
      node.classList.add('component-element')
    }
    // we need unique refs for each component element to be able to select them
    // we also need it for the component root element and the hole when we are in a page
    // this happens when we parse existing components, or we add new components
    if (HelperComponent.isComponentElement(node) || HelperComponent.isComponent(node) ||
      (HelperFile.isPageFile(this._file, this._folder) &&
      HelperComponent.isComponentHole(node)) || this._options.newComponent) {
      HelperDOM.prependClass(node, HelperElement.generateElementRef())
    }
    this.debugNode(node, component)
  },

  debugNode (node, component) {
    if (!this._debug) return
    const tab = (' ').repeat(component?.level)
    const ref = HelperElement.getRef(node)
    if (HelperComponent.isComponent(node) && HelperComponent.isComponentHole(node)) {
      console.info(tab, 'component root and hole', ref, component?.level)
    } else if (HelperComponent.isComponent(node)) {
      console.info(tab, 'component root', ref, component?.level)
    } else if (HelperComponent.isComponentHole(node)) {
      console.info(tab, 'component hole', ref, component?.level)
    } else { // element
      console.info(tab, HelperElement.getType(node), ref, component?.level)
    }
  },

  debugComponent (node, component) {
    if (!this._debug) return
    const tab = (' ').repeat(component.level)
    const file = HelperComponent.getInstanceFile(node).replace('.html', '')
    console.info(tab, file, component.level)
  },

  debugMsg (msg) {
    if (this._debug) console.info(msg)
  },

  getHtmlFromFile (file) {
    return fs.readFileSync(file).toString()
  },

  mergeComponentData (element, data) {
    const main = HelperComponent.getComponentData(element)
    if (main) data.main = main
    HelperComponent.setComponentData(element, data)
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

  // check RightHtmlCommon.getIgnoredAttributes()
  cleanAttributes (node) {
    for (const attr of node.attributes) {
      if (attr.name === 'hidden') {
        node.setAttributeNS(null, 'data-ss-hidden', attr.value)
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

  setBasic (node, type, component) {
    if (!node.getAttributeNS(null, 'class')) {
      throw new Error(`Unknown ${type} element ${this.errorEscapeHtml(node.outerHTML)}`)
    }
    this.setOverrideAttributes(node, component)
    this.setAbsoluteSource(node)
    this.cleanAttributes(node)
    this.cleanClasses(node)
    this.addCanvasClasses(node, type)
    this.addComponentClasses(node, component)
  },

  setOverrideAttributes (node, component) {
    const ref = HelperElement.getRef(node)
    if (component?.data?.overrides && component.data.overrides[ref]?.attributes) {
      for (const [name, obj] of Object.entries(component.data.overrides[ref].attributes)) {
        this.setOverrideAttribute(name, obj, node)
      }
    }
  },

  setOverrideAttribute (name, obj, node) {
    if (obj.delete) {
      node.removeAttributeNS(null, name)
    } else {
      const val = this.setAbsoluteUrlAttribute(name, obj.value)
      node.setAttributeNS(null, name, val)
    }
  },

  setAbsoluteUrlAttribute (name, value) {
    if (['src', 'poster', 'data'].includes(name)) {
      return File.resolve(this._folder, value)
    } else if (name === 'srcset') {
      return this.fixSrcSet(value)
    } else {
      return value
    }
  },

  addCanvasClasses (node, type) {
    node.classList.add('element')
    if (type !== 'block' && type !== 'text') {
      node.classList.add(type)
    }
  },

  setIconElement (node, component, ref) {
    this.setComponentInner(node, component, ref)
    this.setBasic(node, 'icon', component)
  },

  setImageElement (node, component) {
    const srcset = this.fixSrcSet(node.getAttributeNS(null, 'srcset'))
    node.setAttributeNS(null, 'srcset', srcset)
    this.setBasic(node, 'image', component)
  },

  fixSrcSet (value) {
    // only the folder needs to be encoded because the images are saved as encoded in the html
    return value.replace(/(,)?( )?(.+?)( .x)/g, `$1$2${encodeURI(this._folder)}/$3$4`)
  },

  setMediaElement (node, tag, component, ref) {
    this.setComponentInner(node, component, ref)
    this.setBasic(node, tag, component)
    this.setTrackSource(node)
  },

  setComponentInner (node, component, ref) {
    if (component?.data?.overrides && component.data.overrides[ref]?.inner) {
      node.innerHTML = component.data.overrides[ref].inner
    }
  },

  setTrackSource (node) {
    for (const child of node.children) {
      this.setAbsoluteSource(child)
    }
  },

  setInputElement (node, component) {
    if (['range', 'color', 'file'].includes(node.type)) {
      this.setBasic(node, node.type, component)
    } else if (node.type === 'checkbox' || node.type === 'radio') {
      this.setBasic(node, 'checkbox', component)
    } else {
      this.setBasic(node, 'input', component)
    }
  },

  setDropdownElement (node, tag, component, ref) {
    this.setComponentInner(node, component, ref)
    const cls = (tag === 'select') ? 'dropdown' : tag
    this.setBasic(node, cls, component)
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

  setTextElement (node, component, ref) {
    this.setComponentInner(node, component, ref)
    this.setTagElement(node, 'text', 'p', component)
  },

  setInlineElement (node, component) {
    this.setBasic(node, 'inline', component)
    if (node.children.length) {
      this.prepareChildren(node.children, component)
    }
  },

  setTagElement (node, type, tag, component) {
    node = this.processNodeTag(node, component)
    this.setBasic(node, type, component)
    this.setElementChildren(node, component)
  },

  processNodeTag (node, component) {
    const ref = HelperElement.getRef(node)
    let tag = HelperDOM.getTag(node)
    if (component?.data?.overrides && component.data.overrides[ref]?.tag) {
      tag = component.data.overrides[ref].tag
      if (HelperElement.isNormalTag(tag)) {
        node = HelperDOM.changeTag(node, tag, this._document)
      }
    }
    node = this.changeNodeSpecialTag(node, tag)
    return node
  },

  changeNodeSpecialTag (node, tag) {
    if (HelperElement.isNormalTag(tag)) return node
    node = HelperDOM.changeTag(node, 'div', this._document)
    node.setAttributeNS(null, 'data-ss-tag', tag)
    return node
  },

  setElementChildren (node, component) {
    const children = HelperDOM.getChildren(node)
    if (children) {
      this.prepareChildren(children, {
        ...component,
        level: this.adjustComponentLevel('element', component?.level)
      })
    } else if (component?.children && HelperComponent.isComponentHole(node)) {
      node.innerHTML = component.children
      this.prepareChildren(node.children, {
        ...component,
        level: this.adjustComponentLevel('component-hole', component?.level)
      })
    }
  },

  // this is called when we add a component to the canvas
  async parseComponentFile (file) {
    const folder = await Cookie.getCookie('currentFolder')
    const html = fs.readFileSync(file).toString()
    const dom = new JSDOM(html)
    return this.parseHtml(dom.window.document, file, folder, { newComponent: true })
  }
}
