import fs from 'fs'
import glob from 'glob'
import Handlebars from 'handlebars'
import ExtendJS from '../js/helper/ExtendJS.js'
import Language from '../electron/lib/Language.js'

export default {
  getHtmlTemplate (file, options = {}) {
    // options: vars, partialFiles, partialDir
    const template = Handlebars.compile(this.getHtmlFromFile(file))
    this.setHelpers(options.locale || 'en')
    this.setPartials(options)
    return template(options.vars || {})
  },

  getHtmlFromFile (file) {
    return fs.readFileSync(file).toString()
  },

  setHelpers (locale) {
    this.setLanguageHelper(locale)
    this.setIfHelper()
  },

  setLanguageHelper (locale) {
    Handlebars.registerHelper('i18n', options => {
      return Language.localize(options.fn(this), locale)
    })
  },

  setIfHelper () {
    Handlebars.registerHelper('if_eq', (a, b, options) => {
      if (a === b) {
        return options.fn(this)
      } else {
        return options.inverse(this)
      }
    })
  },

  setPartials (options) {
    let partials = {}
    if (options.partialDir) {
      partials = { ...partials, ...this.getPartialsFromDir(options.partialDir) }
    }
    if (options.partialFiles) {
      partials = { ...partials, ...this.getPartialsFromFiles(options.partialFiles) }
    }
    if (partials) Handlebars.registerPartial(partials)
  },

  getPartialsFromDir (dir) {
    const files = glob.sync(`${dir}/**/*.html`)
    return this.getPartialsFromFiles(files)
  },

  getPartialsFromFiles (files) {
    const partials = {}
    for (const file of files) {
      const name = ExtendJS.toCamelCase(file.replace('./src/html/partial/', '')
        .replace('.html', ''))
      partials[name] = this.getHtmlFromFile(file)
    }
    return partials
  }
}
