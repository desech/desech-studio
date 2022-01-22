import fs from 'fs'
import { JSDOM } from 'jsdom'
import Cookie from '../../lib/Cookie.js'
import HelperElement from '../../../js/helper/HelperElement.js'
import HelperDOM from '../../../js/helper/HelperDOM.js'
import File from '../File.js'
import HelperComponent from '../../../js/helper/HelperComponent.js'
import HelperFile from '../../../js/helper/HelperFile.js'
import ParseCommon from './ParseCommon.js'
import ParseOverride from './ParseOverride.js'
import HelperOverride from '../../../js/helper/HelperOverride.js'
import HelperStyle from '../../../js/helper/HelperStyle.js'

export default {
  _document: null,
  _folder: null,
  _options: null,
  _body: null,
  // change this when you want to debug component inheritance
  _debug: false,

  parseHtml (document, file, folder, options) {
    this.debugMsg('\n\nParsing started')
    this.init(document, file, folder, options)
    const component = {
      data: this.extractComponentData(),
      level: options.newComponent ? 1 : 0
    }
    if (this._body) this.prepareElement(this._body, component)
    return {
      canvas: this.returnBody() || null,
      meta: this.returnMeta() || null,
      component: component.data || null
    }
  },

  init (document, file, folder, options) {
    this._document = document
    this._file = file
    this._folder = folder
    this._options = options
    // we have 2 ui options: editor (default) and export
    if (!this._options.ui) this._options.ui = 'editor'
    this._body = this.getBody(document.body)
  },

  getBody (body) {
    // components also have <body> but we don't want it
    return (this._options.isComponent || this._options.newComponent) ? body.children[0] : body
  },

  extractComponentData () {
    if ((!this._options.isComponent && !this._options.componentData) || !this._body) {
      return null
    }
    const main = this._body.dataset.ssComponent
    this._body.removeAttributeNS(null, 'data-ss-component')
    const data = this.getComponentData(main)
    return {
      ...data,
      fullOverrides: HelperOverride.getTopComponentFullOverrides(data)
    }
  },

  getComponentData (main) {
    if (this._options.componentData) {
      if (main) this._options.componentData.main = JSON.parse(main)
      return this._options.componentData
    } else {
      return main ? { main: JSON.parse(main) } : null
    }
  },

  returnBody () {
    if (this._body) {
      return this._body.outerHTML.trim().replace('<body', '<div').replace('</body>', '</div>')
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
    const ref = HelperElement.getStyleRef(node)
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
    this.cleanClasses(body)
    this.cleanBody(body)
    if (body.children.length) {
      this.prepareChildren(body.children, null)
    }
  },

  cleanBody (body) {
    if (this._options.ui === 'export') return
    body.classList.add('element')
    body.classList.add('body')
  },

  setComponent (div, parentData) {
    const instanceData = HelperComponent.getComponentData(div)
    ParseOverride.setOverrideComponentFile(instanceData, parentData?.data?.fullOverrides)
    const mainComponent = this.getMainComponent(div, instanceData)
    if (!mainComponent) return
    this.mergeComponentData(mainComponent, instanceData)
    this.debugComponent(div, parentData)
    const children = div.innerHTML
    // we need the replace before the prepare because the tag change will overwrite the div
    div.replaceWith(mainComponent)
    this.prepareComponent(mainComponent, parentData, children)
  },

  getMainComponent (div, instanceData) {
    instanceData.file = File.resolve(this._folder, instanceData.file)
    if (!fs.existsSync(instanceData.file)) {
      div.remove()
      return
    }
    const html = fs.readFileSync(instanceData.file).toString()
    return this._document.createRange().createContextualFragment(html).children[0]
  },

  mergeComponentData (mainComponent, instanceData) {
    const main = HelperComponent.getComponentData(mainComponent)
    if (main) instanceData.main = main
    HelperComponent.setComponentData(mainComponent, instanceData)
  },

  prepareComponent (mainComponent, parentData, children) {
    const level = this.adjustComponentLevel('component', parentData?.level)
    const data = this.overrideComponent(mainComponent, parentData)
    this.cleanComponentData(mainComponent, data)
    this.setComponentCssRequirements(mainComponent, data)
    this.prepareElement(mainComponent, {
      data,
      level,
      parent: parentData,
      children
    })
  },

  overrideComponent (mainComponent, parentData) {
    const fullOverrides = parentData?.data?.fullOverrides
    ParseOverride.setOverrideComponentVariants(mainComponent, fullOverrides)
    ParseOverride.setOverrideComponentProperties(mainComponent, fullOverrides)
    return ParseOverride.getSubComponentData(mainComponent, fullOverrides)
  },

  cleanComponentData (element, data) {
    // when we set the data again, it will also remove the missing variants
    HelperComponent.setComponentData(element, data)
  },

  setComponentCssRequirements (element, data) {
    HelperDOM.prependClass(element, data.ref)
    HelperComponent.setDataVariant(element, data)
    const cls = HelperComponent.getComponentClass(data.file, this._folder)
    element.classList.add(cls)
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
    if ((this._options.isComponent || this._options.newComponent) && this._body === node &&
      component.data.ref) {
      this.setComponentCssRequirements(node, component.data)
    }
    if (this._options.ui === 'export') return
    this.addComponentElementCls(node, component)
    this.addComponentPositionRef(node)
    this.debugNode(node, component)
  },

  addComponentElementCls (node, component) {
    // level 0 and 1 are regular elements, while level 2 and 3 are component elements
    if ((component?.level === 2 && !HelperComponent.isComponentHole(node)) ||
      component?.level > 2) {
      node.classList.add('component-element')
    }
  },

  addComponentPositionRef (node) {
    // we need unique refs for each component element to be able to select them
    // we also need it for the component root element and the hole when we are in a page
    // this happens when we parse existing components, or we add new components
    if (HelperComponent.isComponentElement(node) || HelperComponent.isComponent(node) ||
      (HelperFile.isPageFile(this._file, this._folder) &&
      HelperComponent.isComponentHole(node)) || this._options.newComponent) {
      HelperDOM.prependClass(node, HelperElement.generateElementRef())
    }
  },

  debugNode (node, component) {
    if (!this._debug) return
    const tab = (' ').repeat(component?.level)
    const ref = HelperElement.getStyleRef(node)
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
    const level = component?.level || 0
    const tab = (' ').repeat(level)
    const file = HelperComponent.getInstanceFile(node).replace('.html', '')
    console.info(tab, file, level)
  },

  debugMsg (msg) {
    if (this._debug) console.info(msg)
  },

  setAbsoluteSource (node) {
    if (this._options.ui === 'export') return
    const tag = HelperDOM.getTag(node)
    if (tag !== 'iframe' && node.src) node.src = this.getAbsPath(node, 'src')
    if (node.poster) node.poster = this.getAbsPath(node, 'poster')
    if (tag === 'object' && node.data) node.data = this.getAbsPath(node, 'data')
  },

  getAbsPath (node, attr) {
    return File.resolve(this._folder, node.getAttributeNS(null, attr))
  },

  cleanClasses (node) {
    if (this._options.ui === 'export') return
    const classes = []
    for (const cls of node.classList) {
      if (HelperStyle.isValidCssClass(cls)) {
        classes.push('_ss_' + cls)
      } else {
        classes.push(cls)
      }
    }
    HelperDOM.addRemoveAttribute(node, 'class', classes.join(' '))
  },

  // we first set the `inner` text and then the attributes, which allows us to overwrite
  // attributes/etc on new inline elements
  // but because of react and how we set the inner text, we can't have variables, which means
  // no overrides for inline elements
  // this forces us to replace the entire inner text, even if you change an attribute on an
  // inner bold text element
  setBasic (node, type, component) {
    if (!node.getAttributeNS(null, 'class')) {
      throw new Error(`Unknown ${type} element ${HelperDOM.escapeHtml(node.outerHTML)}`)
    }
    this.setBasicOverrides(node, component?.data?.fullOverrides)
    this.setAbsoluteSource(node)
    this.cleanClasses(node)
    this.addCanvasClasses(node, type)
    this.addComponentClasses(node, component)
  },

  setBasicOverrides (node, overrides) {
    ParseOverride.setOverrideAttributes(node, overrides, this._folder)
    ParseOverride.setOverrideElementProperties(node, overrides)
    ParseOverride.setOverrideClasses(node, overrides)
  },

  addCanvasClasses (node, type) {
    if (this._options.ui === 'export') return
    node.classList.add('element')
    if (type !== 'block' && type !== 'text') {
      node.classList.add(type)
    }
  },

  setIconElement (node, component, ref) {
    ParseOverride.setOverrideInner(node, component?.data?.fullOverrides, ref)
    this.setBasic(node, 'icon', component)
    this.formatSvgChildren(node.children)
  },

  formatSvgChildren (children) {
    for (const child of children) {
      this.cleanClasses(child)
      if (child.children) {
        this.formatSvgChildren(child.children)
      }
    }
  },

  setImageElement (node, component) {
    this.setSrcSet(node)
    this.setBasic(node, 'image', component)
  },

  setSrcSet (node) {
    if (this._options.ui === 'export') return
    const srcset = ParseCommon.fixSrcSet(node.getAttributeNS(null, 'srcset'), this._folder)
    node.setAttributeNS(null, 'srcset', srcset)
  },

  setMediaElement (node, tag, component, ref) {
    ParseOverride.setOverrideInner(node, component?.data?.fullOverrides, ref)
    this.setBasic(node, tag, component)
    this.setTrackSource(node)
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
    ParseOverride.setOverrideInner(node, component?.data?.fullOverrides, ref)
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
      'cite|dfn|samp|data|code|var|kbd|bdo|bdi|ruby|rp|rt)'
  },

  setTextElement (node, component, ref) {
    ParseOverride.setOverrideInner(node, component?.data?.fullOverrides, ref)
    this.setTagElement(node, 'text', 'p', component)
  },

  setInlineElement (node, component) {
    this.setBasic(node, 'inline', component)
    if (node.children.length) {
      this.prepareChildren(node.children, component)
    }
  },

  setTagElement (node, type, tag, component) {
    node = this.processNodeTag(node, component, node === this._body)
    this.setBasic(node, type, component)
    this.setElementChildren(node, component)
  },

  processNodeTag (node, component, isBody) {
    // we store the node tag into a data object, in order for setOverrideTag to overwrite the node
    const tag = HelperDOM.getTag(node)
    const ref = HelperElement.getStyleRef(node)
    const data = { node, tag, ref }
    ParseOverride.setOverrideTag(data, component?.data?.fullOverrides, this._document)
    node = this.changeNodeSpecialTag(data.node, data.tag)
    // although we overwrite the node, if this is the body, then we also need to update body
    if (isBody) this._body = node
    return node
  },

  changeNodeSpecialTag (node, tag) {
    // changing the tag will replace the node, this is why we need to return it
    if (HelperElement.isNormalTag(tag)) return node
    node = HelperDOM.changeTag(node, 'div', this._document)
    node.setAttributeNS(null, 'data-ss-tag', tag)
    return node
  },

  setElementChildren (node, component) {
    const children = HelperDOM.getChildren(node)
    if (children) {
      this.setStandardChildren(component, children)
    } else if (component?.children && HelperComponent.isComponentHole(node)) {
      this.setComponentChildren(node, component)
    }
  },

  setStandardChildren (component, children) {
    this.prepareChildren(children, {
      ...component,
      level: this.adjustComponentLevel('element', component?.level)
    })
  },

  setComponentChildren (node, component) {
    node.innerHTML = component.children
    this.prepareChildren(node.children, {
      ...component?.parent,
      level: this.adjustComponentLevel('component-hole', component?.level)
    })
  },

  // this is called when we add a component to the canvas
  async parseComponentFile (data) {
    const folder = await Cookie.getCookie('currentFolder')
    const html = fs.readFileSync(data.file).toString()
    const dom = new JSDOM(html)
    const options = { newComponent: true, componentData: data }
    return this.parseHtml(dom.window.document, data.file, folder, options)
  }
}
