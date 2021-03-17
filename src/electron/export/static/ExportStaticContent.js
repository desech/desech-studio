import fs from 'fs'
import path from 'path'
import { JSDOM } from 'jsdom'

export default {
  getPageHtml (folder, file) {
    const dom = new JSDOM(fs.readFileSync(file).toString())
    this.buildComponents(folder, dom.window.document, dom.window.document)
    this.replaceCssLinks(dom.window.document)
    this.replaceScript(dom.window.document)
    const html = dom.serialize()
    return html
  },

  // code copied from desech.js and adapted to node.js
  buildComponents (folder, document, container, data = {}) {
    for (const script of container.querySelectorAll('script[type="text/html"]')) {
      data = { ...script.dataset, ...data }
      const componentFile = path.resolve(folder, script.src)
      const html = fs.readFileSync(componentFile).toString()
      const div = document.createElement('div')
      div.innerHTML = this.parseComponentHtml(html, data)
      const scriptHtml = script.innerHTML
      script.replaceWith(div)
      this.buildComponents(folder, document, div, data)
      this.buildComponentChildren(folder, document, div, scriptHtml)
    }
  },

  parseComponentHtml (componentHtml, data) {
    return componentHtml.replace(/{{([a-z0-9]*)}}/gi, (match, property) => {
      return data[property] || match
    })
  },

  buildComponentChildren (folder, document, div, scriptHtml) {
    const container = div.getElementsByClassName('component-children')[0]
    if (!container) return
    container.innerHTML = scriptHtml
    this.buildComponents(folder, document, container)
  },

  replaceCssLinks (document) {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(el => el.remove())
    const cssLink = '<link rel="stylesheet" href="css/compiled/style.css">'
    document.head.insertAdjacentHTML('beforeend', cssLink)
  },

  replaceScript (document) {
    const script = document.querySelector('script[src="js/desech.js"]')
    script.src = 'js/script.js'
  }
}
