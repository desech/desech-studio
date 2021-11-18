import fs from 'fs'
import { JSDOM } from 'jsdom'
import { URL } from 'whatwg-url'
import ParseHtml from './parse/ParseHtml.js'
import ParseCss from './parse/ParseCss.js'
import CustomResourceLoader from './parse/CustomResourceLoader.js'
import Cookie from '../lib/Cookie.js'
import Font from '../lib/Font.js'
import File from './File.js'
import HelperFile from '../../js/helper/HelperFile.js'

export default {
  async parseHtmlCssFile (file, options = {}) {
    const folder = await Cookie.getCookie('currentFolder')
    const html = fs.readFileSync(file).toString()
    const dom = new JSDOM(html, {
      resources: new CustomResourceLoader(),
      url: new URL('file:' + File.resolve(file))
    })
    const data = await this.parseOnDomReady(dom.window.document, file, folder, options)
    data.font = options.ignoreFonts ? null : Font.getFontsList(folder)
    return data
  },

  parseOnDomReady (document, file, folder, options) {
    return new Promise((resolve, reject) => {
      document.addEventListener('DOMContentLoaded', async () => {
        try {
          const data = await this.parseDom(document, file, folder, options)
          return resolve(data)
        } catch (error) {
          reject(error)
        }
      })
    })
  },

  async parseDom (document, file, folder, options) {
    const opts = { isComponent: HelperFile.isComponentFile(file, folder) }
    const html = options.ignoreHtml ? null : ParseHtml.parseHtml(document, file, folder, opts)
    const css = await this.parseCss(document, folder, options)
    return { html, css }
  },

  async parseCss (document, folder, options) {
    if (document.styleSheets.length) {
      return ParseCss.parseCss(document, folder, options)
    } else {
      return await this.parseIndexCss(folder)
    }
  },

  async parseIndexCss (folder) {
    // for components, parse index.html for the css, but ignore its element css file and html
    const index = File.resolve(folder, 'index.html')
    const options = { ignoreFonts: true, ignoreHtml: true, ignoreElementCss: true }
    const data = await this.parseHtmlCssFile(index, options)
    return data.css
  }
}
