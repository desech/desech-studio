import path from 'path'
import { ResourceLoader } from 'jsdom'

export default class CustomResourceLoader extends ResourceLoader {
  async fetch (url, options) {
    if (path.extname(url) === '.css') {
      return await this.formatCssFile(url, options)
    }
    return await super.fetch(url, options)
  }

  async formatCssFile (url, options) {
    const file = path.basename(url)
    if (file === 'reset.css') {
      // ignore this file
      return Promise.resolve(Buffer.from(''))
    }
    if (file === 'component-css.css') {
      return await this.formatComponentCss(url, options)
    }
    return await super.fetch(url, options)
  }

  async formatComponentCss (url, options) {
    const css = (await super.fetch(url, options)).toString()
    // add "_ss_" to selectors
    const formatted = css.replaceAll('.', '._ss_')
    return Promise.resolve(Buffer.from(formatted))
  }
}
