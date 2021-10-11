import HelperCanvas from '../../helper/HelperCanvas.js'
import HelperFile from '../../helper/HelperFile.js'
import HelperDOM from '../../helper/HelperDOM.js'
import HelperStyle from '../../helper/HelperStyle.js'
import HelperDesignSystem from '../../helper/HelperDesignSystem.js'
import HelperProject from '../../helper/HelperProject.js'
import HelperElement from '../../helper/HelperElement.js'
import '../../compiled/beautify-html.js'

export default {
  _css: null,
  _designSystemClasses: null,

  getHtml (file, css) {
    this.init(css)
    const canvas = HelperCanvas.getCanvas().cloneNode(true)
    this.removeNonCanvasElements(canvas)
    this.prepareElement(canvas.children[0])
    return this.returnHtml(canvas.innerHTML, file)
  },

  init (css) {
    this._css = css
    this._designSystemClasses = HelperDesignSystem.getDesignSystemClasses()
  },

  removeNonCanvasElements (canvas) {
    canvas.querySelectorAll('[hidden]:not([data-ss-hidden])').forEach(el => el.remove())
  },

  prepareElement (node) {
    if (!node) return
    if (node.classList.contains('body')) {
      this.setBody(node)
    } else if (node.dataset.ssComponent) {
      this.setComponent(node, JSON.parse(node.dataset.ssComponent))
    } else {
      this.setRelativeSource(node)
      this.setBasic(node)
    }
  },

  prepareChildren (children) {
    for (const node of children) {
      this.prepareElement(node)
    }
  },

  setBody (node) {
    const body = HelperDOM.changeTag(node, 'body', document)
    this.cleanAttributes(body)
    this.cleanClasses(body)
    if (body.children.length) this.prepareChildren(body.children)
  },

  setComponent (node, data) {
    const div = document.createElement('div')
    div.classList.add('component')
    data.file = HelperFile.getRelPath(data.file)
    div.setAttributeNS(null, 'data-component', JSON.stringify(data))
    this.setComponentChildren(div, node)
    node.replaceWith(div)
  },

  setComponentChildren (div, node) {
    const container = HelperElement.getComponentChildren(node)
    if (!container || !container.children) return
    this.prepareChildren(container.children)
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
      const [file, scaling] = set.split(' ')
      values.push(HelperFile.getRelPath(file) + ' ' + scaling)
    }
    node.srcset = values.join(', ')
  },

  setRelativeSourceAttr (node, attr) {
    const source = node.getAttributeNS(null, attr)
    node[attr] = HelperFile.getRelPath(source)
  },

  setBasic (node) {
    node = this.changeTag(node)
    this.cleanAttributes(node)
    this.cleanClasses(node)
    // <noscript> can't have children
    const children = HelperDOM.getChildren(node)
    if (children) this.prepareChildren(children)
  },

  changeTag (node) {
    if (!node.hasAttributeNS(null, 'data-ss-tag')) return node
    const tag = node.getAttributeNS(null, 'data-ss-tag')
    node.removeAttributeNS(null, 'data-ss-tag')
    return HelperDOM.changeTag(node, tag, document)
  },

  // check ParseHtml.cleanAttributes(), RightHtmlCommon.getIgnoredAttributes()
  cleanAttributes (node) {
    for (const attr of node.attributes) {
      if (!attr.name.startsWith('data-ss-')) continue
      if (attr.name === 'data-ss-hidden') node.setAttributeNS(null, 'hidden', '')
      // JSDOM doesn't use a live list
      node.removeAttributeNS(null, attr.name)
    }
  },

  cleanClasses (node) {
    const cls = node.getAttributeNS(null, 'class')
    if (!cls) return
    const array = []
    for (let val of cls.split(' ')) {
      if (val.includes('_ss_') && !this.componentExists(val) &&
        !this.componentNotDesignSystem(val)) {
        continue
      }
      val = this.filterClass(val.trim())
      if (val) array.push(val)
    }
    node.setAttributeNS(null, 'class', array.join(' '))
  },

  filterClass (cls) {
    // we allow `block`, `text`, `component` and `component-children`
    const ignore = ['selected', 'element', 'body', 'inline', 'icon', 'image', 'video', 'audio',
      'iframe', 'object', 'canvas', 'input', 'datalist', 'dropdown', 'textarea', 'checkbox',
      'range', 'color', 'file', 'progress', 'meter']
    if (ignore.includes(cls)) return
    return cls.replace('_ss_', '')
  },

  componentExists (cls) {
    for (const val of this._css.componentCss) {
      if (!val[0]) continue
      const selector = val[0].selector.replace('.', '._ss_')
      if (HelperStyle.extractClassSelector(selector) === cls) return true
    }
    return false
  },

  componentNotDesignSystem (cls) {
    if (!this._designSystemClasses) return
    for (const designClass of this._designSystemClasses) {
      if (designClass === cls.replace('_ss_', '')) return true
    }
    return false
  },

  returnHtml (body, file) {
    const cleanBody = this.beautifyHtml(body)
    if (HelperFile.isComponentFile(file)) return cleanBody
    const meta = HelperProject.getFileMeta()
    return HelperFile.getFullHtml(file, cleanBody, meta)
  },

  beautifyHtml (body) {
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
