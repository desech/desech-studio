import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import ExtendJS from '../../src/js/helper/ExtendJS.js'
import Zip from '../../src/electron/file/Zip.js'

// node --experimental-json-modules build/scripts/build-font.js _FONT_KEY_
const build = {
  _fontApiKey: null,
  _baseFolder: './download',

  async runUpdateFonts () {
    this._fontApiKey = process.argv[2]
    const currentList = await this.getCurrentFonts()
    this.pushTempCurrentFontsList(currentList)
    const previousList = this.getPreviousFonts()
    await this.processFonts(currentList, previousList)
    this.replaceList()
  },

  async getCurrentFonts () {
    const fonts = []
    const list = await this.getCurrentList()
    for (const font of list.items) {
      fonts.push(this.formatFont(font))
    }
    return fonts
  },

  async getCurrentList () {
    console.log('Fetching fonts list')
    const url = 'https://www.googleapis.com/webfonts/v1/webfonts?sort=alpha&key=' +
      this._fontApiKey
    const response = await fetch(url)
    return await response.json()
  },

  formatFont (font) {
    return {
      family: font.family,
      category: ExtendJS.toTitleCase(font.category.replace('-', ' ')),
      variants: font.variants,
      subsets: font.subsets,
      version: font.version
    }
  },

  pushTempCurrentFontsList (list) {
    console.log('Saving temp fonts list')
    const json = JSON.stringify(list, null, 2)
    const file = path.resolve(this._baseFolder, 'font.json.tmp')
    fs.writeFileSync(file, json)
  },

  getPreviousFonts () {
    const file = path.resolve(this._baseFolder, 'font.json')
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file).toString()) : null
  },

  async processFonts (currentList, previousList) {
    console.log('Processing fonts')
    for (const font of currentList) {
      if (this.isSameVersion(font, previousList)) continue
      console.log(`Processing font ${font.family}`)
      await this.processFont(font)
    }
  },

  isSameVersion (font, list) {
    if (!list) return false
    for (const val of list) {
      if (val.family === font.family) return val.version === font.version
    }
    return false
  },

  async processFont (font) {
    const family = font.family.replaceAll(' ', '+')
    const css = await this.getFontCss(font)
    await this.writeCssFile(family, css)
    await this.writeWoffFiles(family, css)
    await this.createZipFile(family)
  },

  async writeCssFile (family, css) {
    const folder = path.resolve(this._baseFolder, 'font', family)
    if (!fs.existsSync(folder)) fs.mkdirSync(folder)
    const file = path.resolve(folder, 'font.css')
    if (fs.existsSync(file)) return
    console.log(`    Saving css file ${file}`)
    const finalCss = css.replace(/https:\/\/fonts.gstatic.com\/s\/.*?\/.*?\//g,
      `../../font/${family}/`)
    fs.writeFileSync(file, finalCss)
  },

  async getFontCss (font) {
    const url = this.getFontCssUrl(font)
    console.log(`    Fetching font ${url}`)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36'
      }
    })
    return await response.text()
  },

  getFontCssUrl (font) {
    const family = font.family.replaceAll(' ', '+')
    const variants = font.variants.join(',').replace(/regular/g, '400')
      .replace(/0italic/g, '0i').replace(/italic/g, '400i')
    const subsets = font.subsets.join(',')
    return `https://fonts.googleapis.com/css?family=${family}:${variants}&display=swap&` +
      `subset=${subsets}`
  },

  async writeWoffFiles (family, css) {
    const files = this.getWoffFiles(css)
    for (const url of files) {
      const file = path.resolve(this._baseFolder, 'font', family, path.basename(url))
      if (fs.existsSync(file)) continue
      console.info(`    Saving woff file ${file}`)
      await fetch(url).then(res => {
        const dest = fs.createWriteStream(file)
        res.body.pipe(dest)
      })
    }
  },

  getWoffFiles (css) {
    const matchUrl = [...css.matchAll(/(\((?<url>https.+woff2)\))+/gmi)]
    const files = []
    for (let i = 0; i < matchUrl.length; i++) {
      files.push(matchUrl[i].groups.url)
    }
    return files
  },

  async createZipFile (family) {
    const file = path.resolve(this._baseFolder, 'font', family + '.zip')
    console.log(`    Saving zip file ${file}`)
    const folder = path.resolve(this._baseFolder, 'font', family)
    await Zip.createZip(file, folder, { includeFolder: true })
    console.log(`    Deleting folder ${folder}`)
    fs.rmdirSync(folder, { recursive: true })
  },

  replaceList () {
    console.log('Replacing json list')
    const oldFile = path.resolve(this._baseFolder, 'font.json.tmp')
    const newFile = path.resolve(this._baseFolder, 'font.json')
    fs.renameSync(oldFile, newFile)
  }
}

build.runUpdateFonts() // async
