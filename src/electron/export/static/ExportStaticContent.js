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

  buildComponents (folder, document, container, data = null) {
    // don't mess with this, only with `querySelectorAll` and `replaceWith` it seems to work
    for (const comp of container.querySelectorAll('div.component')) {
      const properties = this.getProperties(data, comp.dataset.properties)
      const componentFile = path.resolve(folder, comp.getAttributeNS(null, 'src'))
      const html = fs.readFileSync(componentFile).toString()
      const div = document.createElement('div')
      div.innerHTML = this.parseComponentHtml(html, properties)
      const componentHtml = comp.innerHTML
      comp.replaceWith(div)
      this.buildComponents(folder, document, div, properties)
      this.buildComponentChildren(folder, document, div, properties, componentHtml)
    }
  },

  getProperties (data, dataProps) {
    const props = dataProps ? JSON.parse(dataProps) : null
    // order matters, so props overwrite the global data
    return { ...props, ...data }
  },

  parseComponentHtml (html, data) {
    return html.replace(/{{(.*?)}}/g, (match, name) => data[name] || match)
  },

  buildComponentChildren (folder, document, div, data, componentHtml) {
    const container = div.getElementsByClassName('component-children')[0]
    if (!container) return
    container.innerHTML = this.parseComponentHtml(componentHtml, data)
    container.removeAttributeNS(null, 'class')
    // we don't pass the data here because the higher up wrapper will overwrite everything
    this.buildComponents(folder, document, container)
  },

  replaceCssLinks (document) {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(el => el.remove())
    const cssLink = '<link rel="stylesheet" href="css/compiled/style.css">'
    document.head.insertAdjacentHTML('beforeend', cssLink)
  }
}
