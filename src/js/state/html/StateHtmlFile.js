import HelperCanvas from '../../helper/HelperCanvas.js'
import HelperFile from '../../helper/HelperFile.js'
import HelperDOM from '../../helper/HelperDOM.js'
import HelperStyle from '../../helper/HelperStyle.js'
import HelperDesignSystem from '../../helper/HelperDesignSystem.js'
import HelperProject from '../../helper/HelperProject.js'
import HelperComponent from '../../helper/HelperComponent.js'
import Html from '../../../electron/lib/Html.js'

export default {
  _css: null,
  _designSystemClasses: null,

  getHtml (file, css) {
    this.init(css)
    const canvas = HelperCanvas.getCanvas().cloneNode(true)
    this.removeNonCanvasElements(canvas)
    this.prepareElement(canvas.children[0])
    this.addComponentDataToRoot(file, canvas.children[0])
    return this.returnHtml(canvas.innerHTML, file)
  },

  init (css) {
    this._css = css
    this._designSystemClasses = HelperDesignSystem.getDesignSystemClasses()
  },

  removeNonCanvasElements (canvas) {
    canvas.querySelectorAll('[hidden]:not([data-ss-hidden])').forEach(el => el.remove())
  },

  addComponentDataToRoot (file, root) {
    if (!HelperFile.isComponentFile(file)) return
    const data = HelperComponent.getMainData()
    if (!data) return
    root.setAttributeNS(null, 'data-ss-component', JSON.stringify(data))
  },

  prepareElement (node) {
    if (!node) return
    if (node.classList.contains('body')) {
      this.setBody(node)
    } else if (HelperComponent.isComponent(node)) {
      this.setComponentInstance(node)
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

  setComponentInstance (root) {
    const div = document.createElement('div')
    div.classList.add('component')
    this.setComponentInstanceData(div, root)
    this.setComponentChildren(div, root)
    root.replaceWith(div)
  },

  setComponentInstanceData (div, root) {
    const data = HelperComponent.getComponentData(root)
    data.file = HelperFile.getRelPath(data.file)
    if (data.main) delete data.main
    div.setAttributeNS(null, 'data-ss-component', JSON.stringify(data))
  },

  setComponentChildren (div, root) {
    const hole = HelperComponent.getInstanceHole(root)
    if (!hole || !hole.children) return
    this.prepareChildren(hole.children)
    div.innerHTML = hole.innerHTML
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
    node.setAttributeNS(null, 'srcset', values.join(', '))
  },

  setRelativeSourceAttr (node, attr) {
    const source = node.getAttributeNS(null, attr)
    if (!source) return
    const rel = HelperFile.getRelPath(source)
    node.setAttributeNS(null, attr, rel)
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
    return HelperDOM.changeTag(node, tag, document)
  },

  cleanAttributes (node) {
    for (const attr of node.attributes) {
      if (this.getRemovedAttributes().includes(attr.name)) {
        node.removeAttributeNS(null, attr.name)
      }
    }
  },

  // check RightHtmlCommon.getIgnoredAttributes()
  getRemovedAttributes () {
    // we remove the component data, because we add it with addComponentDataToRoot() at the end
    // and with setComponentInstanceData() on the div node
    return ['data-ss-tag', 'data-ss-hidden', 'data-ss-token', 'data-ss-component']
  },

  cleanClasses (node, checkComponent = true) {
    const cls = node.getAttributeNS(null, 'class')
    if (!cls) return
    const array = []
    for (let val of cls.split(' ')) {
      if (checkComponent && val.includes('_ss_') && !this.componentExists(val) &&
        !this.componentNotDesignSystem(val)) {
        continue
      }
      val = this.filterClass(val.trim())
      if (val) array.push(val)
    }
    node.setAttributeNS(null, 'class', array.join(' '))
  },

  filterClass (cls) {
    // we allow `block` and `text`
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
      if (HelperStyle.extractClassSelector(selector) === cls) {
        return true
      }
    }
    return false
  },

  componentNotDesignSystem (cls) {
    if (!this._designSystemClasses) return false
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
    return body ? this.formatHtmlString(Html.beautifyHtml(body)) : ''
  },

  formatHtmlString (html) {
    html = html.replace(/ style=""/g, '')
    const regex = new RegExp(' (hidden|checked|selected|disabled|readonly|required|multiple|' +
      'controls|autoplay|loop|muted|default|reversed)=".*?"', 'g')
    html = html.replace(regex, ' $1')
    return html
  }
}
