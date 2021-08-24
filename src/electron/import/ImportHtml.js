import fs from 'fs'
import Language from '../lib/Language.js'
import File from '../file/File.js'
import EventMain from '../event/EventMain.js'
import FileParse from '../file/FileParse.js'
import HelperFile from '../../js/helper/HelperFile.js'
import ImportPosition from './ImportPosition.js'
import ImportCommon from './ImportCommon.js'
import ImportImage from './ImportImage.js'

export default {
  processHtml (artboard, params, file) {
    const msg = Language.localize('Saving html file <b>{{file}}</b>',
      { file: File.basename(file) })
    EventMain.ipcMainInvoke('mainImportProgress', msg, params.type)
    this.prepareElements(artboard.elements)
    const body = ImportPosition.buildStructure(artboard, params, file)
    if (artboard.elements.length) {
      const msg = Language.localize('<span class="error">{{count}} ignored element(s): {{elements}}</span>',
        { count: artboard.elements.length, elements: this.getIgnoredElements(artboard.elements) })
      EventMain.ipcMainInvoke('mainImportProgress', msg)
    }
    const html = this.getFullHtml(body, params, file)
    return { body, html }
  },

  getIgnoredElements (nodes) {
    const names = []
    for (const node of nodes) {
      names.push('"' + node.name + '"')
    }
    return names.join(', ')
  },

  prepareElements (elements) {
    for (let i = 0; i < elements.length; i++) {
      elements[i].zIndex = i + 1
      elements[i].children = []
      this.removeSvgStyle(elements[i])
    }
  },

  // since we used the fills and strokes as svg code, we need to remove them from css
  removeSvgStyle (element) {
    if (element.desechType !== 'icon') return
    delete element.style.fills
    delete element.style.stroke
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
    const children = this.getHtmlChildren(element, params)
    return `<${tag} class="${cls}"${srcset}${href}>${children}</${tag}>`
  },

  // if a block with an image fill has no children, then it can be an image element
  convertDivToImg (element, params) {
    if (element.desechType !== 'block' || element.designType === 'line' ||
      element.children.length) {
      return
    }
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
    const name = ImportImage.getSvgName(element, params.svgImageNames) + '.svg'
    const image = File.resolve(params.folder, 'asset/image', name)
    fs.writeFileSync(image, element.content)
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
    // because we have new lines between svg tags, this won't remove the width of other nodes
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

  getHtmlChildren (element, params) {
    if (element.children?.length) {
      return this.processNodeChildren(element, element.children, params)
    } else if (element.content) {
      return element.content
    } else {
      return ''
    }
  },

  processNodeChildren (parent, elements, params) {
    let body = ''
    for (const element of elements) {
      element.parentRef = parent.ref
      body += this.getHtmlNode(element, params)
    }
    return body
  }
}
