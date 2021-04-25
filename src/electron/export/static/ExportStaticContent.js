import fs from 'fs'
import path from 'path'
import { JSDOM } from 'jsdom'
import FileParse from '../../file/FileParse.js'
import HelperCrypto from '../../../js/helper/HelperCrypto.js'

export default {
  getPageHtml (folder, file) {
    const rand = HelperCrypto.generateSmallHash()
    const initialHtml = this.replaceTemplate(fs.readFileSync(file).toString(), rand)
    const dom = new JSDOM(initialHtml)
    const document = dom.window.document
    this.buildComponents(folder, document, document)
    this.replaceCssLinks(document)
    this.replaceJsScripts(document)
    const html = this.replaceTemplateBack(this.regexHtmlRender(dom.serialize()), rand)
    return FileParse.beautifyHtml(html)
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
    for (const comp of container.querySelectorAll('div.component')) {
      const properties = this.getProperties(comp)
      const componentFile = path.resolve(folder, comp.getAttributeNS(null, 'src'))
      const html = fs.readFileSync(componentFile).toString()
      const div = document.createElementNS('https://www.w3.org/XML/1998/namespace', 'div')
      this.setElementProperties(comp, div)
      div.innerHTML = this.parseComponentHtml(html, properties)
      const componentHtml = comp.innerHTML
      comp.replaceWith(div)
      this.buildComponents(folder, document, div)
      this.buildComponentChildren(folder, document, div, properties, componentHtml)
    }
  },

  getProperties (node) {
    const string = node.getAttributeNS(null, 'data-element-properties')
    return string ? JSON.parse(string) : {}
  },

  setElementProperties (old, newNode) {
    if (old.hasAttributeNS(null, 'data-element-properties')) {
      const props = old.getAttributeNS(null, 'data-element-properties')
      newNode.setAttributeNS(null, 'data-element-properties', props)
    }
  },

  parseComponentHtml (html, properties) {
    // jsdom fails with innerHTML when having non self closing tags
    html = html.replace(/<(img|input|track)(.*?)>/g, '<$1$2 />')
    // we don't want to see the unmapped properties
    return html.replace(/{{(.*?)}}/g, (match, name) => properties[name] || '')
  },

  buildComponentChildren (folder, document, div, properties, componentHtml) {
    const container = div.getElementsByClassName('component-children')[0]
    if (!container) return
    container.innerHTML = this.parseComponentHtml(componentHtml, properties)
    container.removeAttributeNS(null, 'class')
    this.buildComponents(folder, document, container)
  },

  replaceCssLinks (document) {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(el => el.remove())
    const cssLink = '<link rel="stylesheet" href="css/compiled/style.css">'
    document.head.insertAdjacentHTML('beforeend', cssLink)
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
    return html.replace(/(class="([^><]*?)"([^><]*?))?data-element-properties="(.*?)"/g,
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
  }
}
