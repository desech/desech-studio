import fs from 'fs'
import { JSDOM } from 'jsdom'
import File from '../../file/File.js'
import ExportCommon from '../ExportCommon.js'
import Crypto from '../../lib/Crypto.js'
import Html from '../../lib/Html.js'

export default {
  getPageHtml (folder, file, css) {
    // we replace <template>'s because they are parsed differently than regular html elements,
    // and we don't want that
    const rand = Crypto.generateID()
    const initialHtml = this.replaceTemplate(fs.readFileSync(file).toString(), rand)
    const dom = new JSDOM(initialHtml)
    const document = dom.window.document
    this.buildComponents(folder, document, document)
    this.replaceCssLinks(document)
    this.replaceJsScripts(document)
    this.cleanClasses(document, css)
    const html = this.replaceTemplateBack(this.regexHtmlRender(dom.serialize()), rand)
    return Html.beautifyHtml(html)
  },

  replaceTemplate (html, rand) {
    return html.replaceAll('<template', `<template-${rand}`)
      .replaceAll('</template>', `</template-${rand}>`)
  },

  replaceTemplateBack (html, rand) {
    return html.replaceAll(`<template-${rand}`, '<template')
      .replaceAll(`</template-${rand}>`, '</template>')
  },

  buildComponents (folder, document, container) {
    // don't mess with this, only with `querySelectorAll` and `replaceWith` it seems to work
    for (const comp of container.querySelectorAll('div.component[data-ss-component]')) {
      const data = JSON.parse(comp.dataset.ssComponent)
      const file = File.resolve(folder, data.file)
      const html = this.parseComponentHtml(fs.readFileSync(file).toString())
      // with static, we don't use the component programming properties, because they are never
      // shown, unlike with react/angular/vue
      const element = document.createRange().createContextualFragment(html).children[0]
      const componentHtml = comp.innerHTML
      comp.replaceWith(element)
      this.buildComponents(folder, document, element)
      this.buildComponentChildren(folder, document, element, componentHtml)
    }
  },

  buildComponentChildren (folder, document, element, componentHtml) {
    // some components can also be component holes at the same time
    const container = element.hasAttributeNS(null, 'data-ss-component-hole')
      ? element
      : element.querySelector('[data-ss-component-hole]')
    if (!container) return
    container.removeAttributeNS(null, 'data-ss-component-hole')
    container.innerHTML = this.parseComponentHtml(componentHtml)
    this.buildComponents(folder, document, container)
  },

  parseComponentHtml (html) {
    // jsdom fails with innerHTML when having non self closing tags
    return html.replace(/<(img|input|track)(.*?)>/g, '<$1$2 />')
  },

  replaceCssLinks (document) {
    this.removeProjectCssFiles(document)
    const cssLink = '<link rel="stylesheet" href="css/compiled/style.css">'
    document.head.insertAdjacentHTML('beforeend', cssLink)
  },

  removeProjectCssFiles (document) {
    const links = ExportCommon.getGeneralCssFiles()
    document.querySelectorAll('link[rel="stylesheet"]').forEach(el => {
      const href = el.getAttributeNS(null, 'href')
      if (links.includes(href) || href.startsWith('css/page/')) {
        el.remove()
      }
    })
  },

  replaceJsScripts (document) {
    const script = document.querySelector('script[src="js/design-system.js"]')
    if (script) script.remove()
  },

  regexHtmlRender (html) {
    html = html.replace(/ (hidden|checked|selected|disabled|readonly|required|multiple|controls|autoplay|loop|muted|default|reversed)=".*?"/g,
      ' $1')
    return this.addElementProperties(html)
  },

  addElementProperties (html) {
    // we can't add attributes with setAttributeNS because we allow invalid html/xml attributes
    return html.replace(/(class="([^><]*?)"([^><]*?))?data-ss-properties="(.*?)"/g,
      (match, extraBlock, cls, extra, json) => {
        const props = JSON.parse(json.replaceAll('&quot;', '"'))
        const attrs = this.getPropertyAttributes(props, cls || '')
        return extraBlock ? (attrs + ' ' + extra).trim() : attrs
      }
    )
  },

  getPropertyAttributes (props, cls) {
    const attrs = []
    if (!props.class && cls) attrs.push(`class="${cls}"`)
    for (let [name, value] of Object.entries(props)) {
      value = value.replaceAll('"', '&quot;')
      if (name === 'class') value = (cls + ' ' + value).trim()
      attrs.push(`${name}="${value}"`)
    }
    return attrs.join(' ')
  },

  cleanClasses (document, css) {
    // getElementsByClassName doesn't work correctly with jsdom
    for (const node of document.querySelectorAll('[class*="e0"]')) {
      if (node.classList.contains('text')) node.classList.remove('text')
      // remove the ref classes that don't have any css styles
      const ref = this.getRefFromClasses(node)
      if (!css.includes('.' + ref)) node.classList.remove(ref)
      if (!node.getAttributeNS(null, 'class')) {
        node.removeAttributeNS(null, 'class')
      }
    }
  },

  getRefFromClasses (node) {
    for (const cls of node.classList) {
      if (cls.startsWith('e0')) return cls
    }
  }
}
