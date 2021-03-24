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
    if (HelperDOM.getTag(node) === 'template') {
      return this.addTemplate(node, css, designSystemClasses)
    }
    this.setRelativeSource(node)
    if (node.classList.contains('audio')) this.cleanAudio(node, css, designSystemClasses)
    if (node.classList.contains('input')) this.addDatalist(node)
    this.setBasic(node, css, designSystemClasses)
  },

  addComponent (node, css, designSystemClasses) {
    const div = document.createElement('div')
    div.setAttributeNS(null, 'class', 'component')
    div.setAttributeNS(null, 'src', this.getRelPath(node.getAttributeNS(null, 'src')))
    if (node.dataset.properties) {
      div.setAttributeNS(null, 'data-properties', node.dataset.properties)
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
    if (node.srcset) this.setRelativeSourceSrcset(node)
    for (const attr of ['src', 'poster']) {
      if (node[attr]) this.setRelativeSourceAttr(node, attr)
    }
  },

  setRelativeSourceSrcset (node) {
    const src = HelperFile.getSourceFile(node.srcset)
    const values = []
    for (const set of src.split(', ')) {
      values.push(this.getRelPath(set))
    }
    node.srcset = values.join(', ')
  },

  setRelativeSourceAttr (node, attr) {
    const src = HelperFile.getSourceFile(node[attr])
    node[attr] = this.getRelPath(src)
  },

  getRelPath (attr) {
    const folder = HelperProject.getFolder()
    return attr.replace(folder + '/', '')
  },

  addTemplate (node, css, designSystemClasses) {
    this.cleanAttributes(node)
    this.cleanClasses(node, css, designSystemClasses)
    if (node.content.children.length) {
      this.buildHtml(node.content.children, css, designSystemClasses)
    }
  },

  cleanAudio (div, css, designSystemClasses) {
    const audio = div.children[0]
    this.copyAttributes(div, audio)
    div.replaceWith(audio)
    this.setRelativeSource(audio)
    this.setBasic(audio, css, designSystemClasses)
  },

  copyAttributes (from, to) {
    for (const attr of from.attributes) {
      to.setAttributeNS(null, attr.name, attr.value)
    }
  },

  setBasic (node, css, designSystemClasses) {
    this.cleanAttributes(node)
    this.cleanClasses(node, css, designSystemClasses)
    if (node.children.length) this.buildHtml(node.children, css, designSystemClasses)
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
    const ignore = ['selected', 'element', 'inline', 'icon', 'image', 'video', 'audio', 'input',
      'dropdown', 'textarea', 'checkbox', 'range', 'color', 'file']
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

  addDatalist (node) {
    if (!node.list) return
    const datalist = node.list.cloneNode(true)
    HelperDOM.insertAfter(datalist, node)
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
      inline: [],
      preserve_newlines: false
    }))
  },

  formatHtmlString (html) {
    html = html.replace(/(hidden|checked|selected|disabled|readonly|required|multiple|controls|autoplay|loop|muted|default|reversed)=".*?"/g, '$1')
    html = html.replace(/ style=".*?"/, '')
    return html
  }
}
