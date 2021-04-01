import fs from 'fs'
import path from 'path'
import { JSDOM } from 'jsdom'
import FileParse from '../../file/FileParse.js'

export default {
  getPageHtml (folder, file) {
    const dom = new JSDOM(fs.readFileSync(file).toString())
    this.buildComponents(folder, dom.window.document, dom.window.document)
    this.replaceCssLinks(dom.window.document)
    this.replaceJsScripts(dom.window.document)
    const html = dom.serialize()
    return FileParse.beautifyHtml(html)
  },

  buildComponents (folder, document, container) {
    // don't mess with this, only with `querySelectorAll` and `replaceWith` it seems to work
    for (const comp of container.querySelectorAll('div.component')) {
      const properties = this.getProperties(comp)
      const componentFile = path.resolve(folder, comp.getAttributeNS(null, 'src'))
      const html = fs.readFileSync(componentFile).toString()
      const div = document.createElement('div')
      div.innerHTML = this.parseComponentHtml(html, properties)
      const componentHtml = comp.innerHTML
      comp.replaceWith(div)
      this.buildComponents(folder, document, div)
      this.buildComponentChildren(folder, document, div, properties, componentHtml)
    }
  },

  getProperties (div) {
    const string = div.dataset.elementProperties
    return string ? JSON.parse(string) : {}
  },

  parseComponentHtml (html, properties) {
    return html.replace(/{{(.*?)}}/g, (match, name) => properties[name] || match)
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
  }
}
