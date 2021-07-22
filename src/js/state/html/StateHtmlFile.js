import HelperCanvas from '../../helper/HelperCanvas.js'
import HelperFile from '../../helper/HelperFile.js'
import HelperDOM from '../../helper/HelperDOM.js'
import HelperStyle from '../../helper/HelperStyle.js'
import HelperDesignSystem from '../../helper/HelperDesignSystem.js'
import HelperProject from '../../helper/HelperProject.js'
import HelperElement from '../../helper/HelperElement.js'
import '../../compiled/beautify-html.js'

export default {
  getHtml (file, css) {
    const canvas = HelperCanvas.getCanvas().cloneNode(true)
    const designSystemClasses = HelperDesignSystem.getDesignSystemClasses()
    this.removeNonCanvasElements(canvas)
    this.buildHtml(canvas.children, css, designSystemClasses)
    return this.returnHtml(canvas.innerHTML, file)
  },

  removeNonCanvasElements (canvas) {
    canvas.querySelectorAll('[hidden]:not([data-ss-hidden])').forEach(el => el.remove())
  },

  buildHtml (nodes, css, designSystemClasses) {
    for (const node of nodes) {
      this.buildElement(node, css, designSystemClasses)
    }
  },

  buildElement (node, css, designSystemClasses) {
    if (node.classList.contains('component')) {
      return this.addComponent(node, css, designSystemClasses)
    }
    this.setRelativeSource(node)
    this.setBasic(node, css, designSystemClasses)
  },

  addComponent (node, css, designSystemClasses) {
    const div = document.createElement('div')
    div.setAttributeNS(null, 'class', 'component')
    div.setAttributeNS(null, 'src', this.getRelPath(node.getAttributeNS(null, 'src')))
    if (node.dataset.elementProperties) {
      div.setAttributeNS(null, 'data-element-properties', node.dataset.elementProperties)
    }
    this.addComponentChildren(div, node, css, designSystemClasses)
    node.replaceWith(div)
  },

  addComponentChildren (div, node, css, designSystemClasses) {
    const container = HelperElement.getComponentChildren(node)
    if (!container || !container.children) return
    this.buildHtml(container.children, css, designSystemClasses)
    div.innerHTML = container.innerHTML
  },

  setRelativeSource (node) {
    const tag = HelperDOM.getTag(node)
    if (node.srcset) this.setRelativeSourceSrcset(node)
    if (tag !== 'iframe' && node.src) this.setRelativeSourceAttr(node, 'src')
    if (node.poster) this.setRelativeSourceAttr(node, 'poster')
    if (tag === 'object' && node.data) this.setRelativeSourceAttr(node, 'data')
  },

  setRelativeSourceSrcset (node) {
    const src = node.getAttributeNS(null, 'srcset')
    const values = []
    for (const set of src.split(', ')) {
      values.push(this.getRelPath(set))
    }
    node.srcset = values.join(', ')
  },

  setRelativeSourceAttr (node, attr) {
    const source = node.getAttributeNS(null, attr)
    node[attr] = this.getRelPath(source)
  },

  getRelPath (attr) {
    const folder = HelperProject.getFolder()
    return attr.replace(folder + '/', '')
  },

  setBasic (node, css, designSystemClasses) {
    node = this.changeTag(node)
    this.cleanAttributes(node)
    this.cleanClasses(node, css, designSystemClasses)
    // noscript can't have children
    const children = HelperDOM.getChildren(node)
    if (children) this.buildHtml(children, css, designSystemClasses)
  },

  changeTag (node) {
    if (!node.hasAttributeNS(null, 'data-ss-tag')) return node
    const tag = node.getAttributeNS(null, 'data-ss-tag')
    node.removeAttributeNS(null, 'data-ss-tag')
    return HelperDOM.changeTag(node, tag, document)
  },

  cleanAttributes (node) {
    // check RightHtmlCommon.js for details
    for (const attr of node.attributes) {
      if (!attr.name.startsWith('data-ss-')) continue
      node.setAttributeNS(null, attr.name.replace('data-ss-', ''), attr.value)
      // JSDOM doesn't use a live list
      node.removeAttributeNS(null, attr.name)
    }
  },

  cleanClasses (node, css, designSystemClasses) {
    const cls = node.getAttributeNS(null, 'class')
    if (!cls) return
    const array = []
    for (let val of cls.split(' ')) {
      if (val.includes('_ss_') && !this.componentExists(val, css) &&
        !this.componentNotDesignSystem(val, designSystemClasses)) {
        continue
      }
      val = this.filterClass(val.trim())
      if (val) array.push(val)
    }
    node.setAttributeNS(null, 'class', array.join(' '))
  },

  filterClass (cls) {
    // we allow `block`, `text`, `component` and `component-children`
    const ignore = ['selected', 'element', 'inline', 'icon', 'image', 'video', 'audio', 'iframe',
      'object', 'canvas', 'input', 'datalist', 'dropdown', 'textarea', 'checkbox', 'range',
      'color', 'file', 'progress', 'meter']
    if (ignore.includes(cls)) return
    return cls.replace('_ss_', '')
  },

  componentExists (cls, css) {
    for (const val of css.componentCss) {
      if (!val[0]) continue
      const selector = val[0].selector.replace('.', '._ss_')
      if (HelperStyle.extractClassSelector(selector) === cls) return true
    }
    return false
  },

  componentNotDesignSystem (cls, designSystemClasses) {
    if (!designSystemClasses) return
    for (const designClass of designSystemClasses) {
      if (designClass === cls.replace('_ss_', '')) return true
    }
    return false
  },

  returnHtml (canvas, file) {
    const html = this.formatHtml(canvas)
    const isComponent = HelperFile.isComponentFile(file)
    const meta = HelperProject.getFileMeta()
    return isComponent ? html : HelperFile.getFullHtml(file, html, meta)
  },

  formatHtml (body) {
    if (!body) return ''
    return this.formatHtmlString(window.html_beautify(body, {
      indent_size: 2,
      preserve_newlines: false
    }))
  },

  formatHtmlString (html) {
    html = html.replace(/ style=""/g, '')
    const regex = new RegExp(' (hidden|checked|selected|disabled|readonly|required|multiple|' +
      'controls|autoplay|loop|muted|default|reversed)=".*?"', 'g')
    html = html.replace(regex, ' $1')
    return html
  }
}
