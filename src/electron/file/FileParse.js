import { JSDOM } from 'jsdom'
import { URL } from 'whatwg-url'
import beautify from 'js-beautify'
import ParseHtml from './parse/ParseHtml.js'
import ParseCss from './parse/ParseCss.js'
import CustomResourceLoader from './parse/CustomResourceLoader.js'
import Cookie from '../lib/Cookie.js'
import Font from '../lib/Font.js'
import File from './File.js'

export default {
  async parseHtmlCssFile (file, parseElementCss = true) {
    const folder = await Cookie.getCookie('currentFolder')
    const html = ParseHtml.getHtmlFromFile(file)
    const dom = new JSDOM(html, {
      resources: new CustomResourceLoader(),
      url: new URL('file:' + File.resolve(file))
    })
    const data = await this.parseFileType(dom.window.document, file, folder, parseElementCss)
    data.font = Font.getFontsList(folder)
    return data
  },

  async parseFileType (document, file, folder, parseElementCss) {
    if (file.startsWith(folder + '/component')) {
      return await this.parseDom(document, folder, parseElementCss)
    } else {
      return await this.parseOnDomReady(document, folder, parseElementCss)
    }
  },

  parseOnDomReady (document, folder, parseElementCss) {
    return new Promise((resolve, reject) => {
      document.addEventListener('DOMContentLoaded', async () => {
        try {
          return resolve(await this.parseDom(document, folder, parseElementCss))
        } catch (error) {
          reject(error)
        }
      })
    })
  },

  async parseDom (document, folder, parseElementCss) {
    const html = ParseHtml.parseHtml(document, folder)
    const css = await this.parseCss(document, folder, parseElementCss)
    return { html, css }
  },

  async parseCss (document, folder, parseElementCss) {
    if (document.styleSheets.length) {
      return ParseCss.parseCss(document, folder, parseElementCss)
    }
    // parse index.html for css, but ignore its element css file
    const index = File.resolve(folder, 'index.html')
    const data = await this.parseHtmlCssFile(index, false)
    return data.css
  },

  beautifyHtml (body) {
    return beautify.html(body, {
      indent_size: 2,
      inline: [],
      preserve_newlines: false
    })
  }
}
