import fs from 'fs'
import Language from '../lib/Language.js'
import File from '../file/File.js'
import EventMain from '../event/EventMain.js'
import FileParse from '../file/FileParse.js'
import HelperFile from '../../js/helper/HelperFile.js'
import ImportPosition from './ImportPosition.js'
import ImportCommon from './ImportCommon.js'

export default {
  processHtml (elements, params, file) {
    const msg = Language.localize('Saving html file <b>{{file}}</b>',
      { file: File.basename(file) })
    EventMain.ipcMainInvoke('mainImportProgress', msg, params.type)
    this.prepareElements(elements)
    const body = ImportPosition.buildStructure(elements)
    const html = this.getFullHtml(body, params, file)
    return { body, html }
  },

  prepareElements (elements) {
    for (let i = 0; i < elements.length; i++) {
      elements[i].zIndex = i + 1
      elements[i].children = []
    }
  },

  getFullHtml (body, params, file) {
    const html = this.getHtmlNode(body, params)
    const beauty = FileParse.beautifyHtml(html)
    return HelperFile.getFullHtml(file, beauty, {}, params.folder, params.settings.designSystem)
  },

  getHtmlNode (element, params) {
    this.convertDivToImg(element, params)
    this.convertBackgroundSvg(element, params)
    const cls = this.getClasses(element)
    if (element.desechType === 'icon') return this.getIconNode(element, cls)
    const tag = this.getHtmlTag(element)
    const srcset = element.srcset ? ` srcset="${element.srcset}"` : ''
    const href = element.href ? ` href="${element.href}"` : ''
    const children = element.children?.length
      ? this.getHtmlChildren(element, element.children, params)
      : element.content
    return `<${tag} class="${cls}"${srcset}${href}>${children}</${tag}>`
  },

  // if a block with an image fill has no children, then it can be an image element
  convertDivToImg (element, params) {
    if (element.desechType !== 'block' || element.children.length) return
    const fill = ImportCommon.getImageFill(element)
    if (!fill) return
    element.desechType = 'image'
    const image = fill.image.replace(params.folder + '/', '')
    element.srcset = `${image} 1x, ${this.getScaledSrcset(image, 2)}, ` +
      `${this.getScaledSrcset(image, 3)}`
  },

  getScaledSrcset (image, scale) {
    const ext = File.extname(image)
    return image.replace(ext, `@${scale}x${ext} ${scale}x`)
  },

  // if an svg icon becomes a block parent, place the svg icon as a background image
  convertBackgroundSvg (element, params) {
    if (element.desechType !== 'block' || !element.content) return
    const image = ImportCommon.getSvgName(element, params.svgImageNames) + '.svg'
    const filePath = File.resolve(params.folder, 'asset/image', image)
    fs.writeFileSync(filePath, element.content)
    element.style.fills = [{ type: 'image', image }]
  },

  getClasses (element) {
    let cls = element.ref
    if (element.desechType === 'block' || element.desechType === 'text') {
      cls += ' ' + element.desechType
    }
    return cls.trim()
  },

  getIconNode (element, cls) {
    // imported svgs sometimes have elements without content
    if (!element.content) return ''
    return element.content.replace('<svg ', `<svg class="${cls}" `)
      .replace(/(<svg.*?) width=".*?"/, '$1')
      .replace(/(<svg.*?) height=".*?"/, '$1')
  },

  getHtmlTag (element) {
    if (element.designType === 'line') return 'hr'
    if (element.href) return 'a'
    switch (element.desechType) {
      case 'block':
        return 'div'
      case 'text':
        return 'p'
      case 'icon':
        return 'svg'
      case 'image':
        return 'img'
    }
  },

  getHtmlChildren (parent, elements, params) {
    let body = ''
    for (const element of elements) {
      element.parentRef = parent.ref
      body += this.getHtmlNode(element, params)
    }
    return body
  }
}