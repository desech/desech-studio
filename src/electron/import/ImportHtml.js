import Language from '../lib/Language.js'
import File from '../file/File.js'
import EventMain from '../event/EventMain.js'
import FileParse from '../file/FileParse.js'
import HelperFile from '../../js/helper/HelperFile.js'
import ImportPosition from './ImportPosition.js'

export default {
  getHtml (elements, params, file) {
    const msg = Language.localize('Saving html file <b>{{file}}</b>',
      { file: File.basename(file) })
    EventMain.ipcMainInvoke('mainImportProgress', msg)
    const html = this.getImportHtml(elements, params)
    const beauty = FileParse.beautifyHtml(html)
    return HelperFile.getFullHtml(file, beauty, {}, params.folder, params.settings.designSystem)
  },

  getImportHtml (elements, params) {
    const body = ImportPosition.buildStructure(elements)
    if (elements.length) {
      const msg = Language.localize('<span class="error">{{count}} element(s) have been ignored - {{elements}}</span>',
        { count: elements.length, elements: this.getIgnoredElements(elements) })
      EventMain.ipcMainInvoke('mainImportProgress', msg)
    }
    return this.getHtmlNode(body, params)
  },

  getIgnoredElements (elements) {
    const names = []
    for (const element of elements) {
      names.push('"' + element.name + '"')
    }
    return names.join(', ')
  },

  getHtmlNode (node, params) {
    if (this.shouldConvertDiv(node)) this.convertDivToImg(node, folder)
    this.addNodeCss(node)
    const cls = this.getClasses(node)
    if (node.type === 'image') return this.getImageNode(node, cls)
    if (node.type === 'icon') return this.getIconNode(node, cls)
    const tag = node.tag || this.getHtmlTag(node.type)
    const href = node.href ? ` href="${node.href}"` : ''
    const children = (node.children && node.children.length)
      ? this.getHtmlChildren(node, node.children, folder)
      : node.content
    if (node.type === 'block' && node.content) this.saveSvgBgImage(node, folder)
    return `<${tag} class="${cls}"${href}>${children}</${tag}>`
  },

  getHtmlChildren (parent, nodes, folder) {
    let body = ''
    for (const node of nodes) {
      node.parentRef = parent.ref
      body += this.getHtmlNode(node, folder)
    }
    return body
  },

  shouldConvertDiv (node) {
    return (node.type === 'block' && !node.elements.length && css.element[node.ref] &&
      css.element[node.ref]['background-image'] &&
      /^url\([^,]*?\)$/.test(css.element[node.ref]['background-image']))
  },

  convertDivToImg (node, folder) {
    node.type = 'image'
    const image = css.element[node.ref]['background-image'].replace('url("../', '')
      .replace('")', '')
    node.srcset = `${image} 1x, ${this.getScaledSrcset(image, 2)}, ` +
      `${this.getScaledSrcset(image, 3)}`
    this.wipeCssOnBackgroundImage(node.ref)
  },

  getScaledSrcset (image, scale) {
    const ext = File.extname(image)
    return image.replace(ext, `@${scale}x${ext} ${scale}x`)
  },

  wipeCssOnBackgroundImage (ref) {
    // figma also exports the effects, borders, etc on images, so we don't need the extra css
    // but for sketch and xd we need to remove the background css properties and the svg strokes
    for (const name of Object.keys(css.element[ref])) {
      if ((this._type === 'figma' && !['width', 'height'].includes(name)) ||
        (this._type !== 'figma' && (name.startsWith('background-') ||
          name.startsWith('stroke')))) {
        delete css.element[ref][name]
      }
    }
  }
}
