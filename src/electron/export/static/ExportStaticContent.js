import fs from 'fs'
import path from 'path'
import { JSDOM } from 'jsdom'
import FileParse from '../../file/FileParse.js'

export default {
  getPageHtml (folder, file) {
    const dom = new JSDOM(fs.readFileSync(file).toString())
    this.buildComponents(folder, dom.window.document, dom.window.document)
    this.replaceCssLinks(dom.window.document)
    const html = dom.serialize()
    return FileParse.beautifyHtml(html)
  },

  buildComponents (folder, document, container, data = {}) {
    // don't mess with this, only with `querySelectorAll` and `replaceWith` it seems to work
    for (const comp of container.querySelectorAll('div.component')) {
      data = { ...comp.dataset, ...data }
      const componentFile = path.resolve(folder, comp.getAttributeNS(null, 'src'))
      const html = fs.readFileSync(componentFile).toString()
      const div = document.createElement('div')
      div.innerHTML = this.parseComponentHtml(html, data)
      const componentHtml = comp.innerHTML
      comp.replaceWith(div)
      this.buildComponents(folder, document, div, data)
      this.buildComponentChildren(folder, document, div, componentHtml)
    }
  },

  parseComponentHtml (html, data) {
    return html.replace(/{{([a-z0-9]*)}}/gi, (match, property) => {
      return data[property] || match
    })
  },

  buildComponentChildren (folder, document, div, componentHtml) {
    const container = div.getElementsByClassName('component-children')[0]
    if (!container) return
    container.innerHTML = componentHtml
    container.removeAttributeNS(null, 'class')
    this.buildComponents(folder, document, container)
  },

  replaceCssLinks (document) {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(el => el.remove())
    const cssLink = '<link rel="stylesheet" href="css/compiled/style.css">'
    document.head.insertAdjacentHTML('beforeend', cssLink)
  }
}
