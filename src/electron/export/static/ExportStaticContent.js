import fs from 'fs'
import { JSDOM } from 'jsdom'
import ExportCommon from '../ExportCommon.js'
import Html from '../../lib/Html.js'
import ParseHtml from '../../file/parse/ParseHtml.js'
import HelperDOM from '../../../js/helper/HelperDOM.js'

export default {
  getPageHtml (folder, file, css) {
    const string = fs.readFileSync(file).toString()
    const dom = new JSDOM(string)
    ParseHtml.parseHtml(dom.window.document, file, folder, { ui: 'export' })
    this.formatDom(dom.window.document, css)
    return this.formatHtml(dom.serialize())
  },

  formatDom (document, css) {
    this.cleanClasses(document, css)
    this.replaceCssLinks(document)
    this.replaceJsScripts(document)
    // needs to be the last one because we are switch to tags like `template`
    this.replaceTags(document.body.children, document)
  },

  cleanClasses (document, css) {
    // getElementsByClassName doesn't work correctly with jsdom
    for (const node of document.querySelectorAll('[class*="e0"]')) {
      if (node.classList.contains('text')) node.classList.remove('text')
      // remove the ref classes that don't have any css styles
      // @todo make sure we don't remove the component root ref class if we have css
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
    // we remove it here because in ExportStaticCode.createScriptJs() we add the js to script.js
    const script = document.querySelector('script[src="js/design-system.js"]')
    if (script) script.remove()
  },

  replaceTags (children, document) {
    for (const node of children) {
      // we need this first, in order to walk the dom from bottom to top
      if (node.children) this.replaceTags(node.children, document)
      if (node.dataset.ssTag) {
        HelperDOM.changeTag(node, node.dataset.ssTag, document)
      }
    }
  },

  formatHtml (html) {
    html = html.replace(/ (hidden|checked|selected|disabled|readonly|required|multiple|controls|autoplay|loop|muted|default|reversed)=".*?"/g,
      ' $1')
    html = html.replace(/ (data-ss-)([a-z-]+)(="(.*?)")?/g, '')
    return Html.beautifyHtml(html)
  }
}
