import EventMain from '../event/EventMain.js'
import Language from '../lib/Language.js'
import Font from '../lib/Font.js'
import Fetch from '../lib/Fetch.js'

export default {
  _baseUrl: 'https://raw.githubusercontent.com/desech/desech-studio/master/download',

  async installFonts (data, params) {
    const elementFonts = this.getElementFonts(data)
    const webFonts = await Fetch.fetch(this._baseUrl + '/font.json')
    const folderFonts = Font.getFontsList(params.folder)
    for (const val of elementFonts) {
      if (this.isGoogleFont(val.name, webFonts)) {
        await this.installGoogleFont(val, folderFonts, params)
      } else {
        const msg = Language.localize('<span class="error">Local font <b>{{font}}</b> is ignored</span>',
          { font: val.name })
        EventMain.ipcMainInvoke('mainImportProgress', msg, params.type)
      }
    }
    return elementFonts
  },

  getElementFonts (data) {
    const fonts = []
    for (const entry of Object.values(data)) {
      if (entry.type === 'folder') {
        for (const file of Object.values(entry.files)) {
          this.processElementFonts(file.elements, fonts)
        }
      } else { // file
        this.processElementFonts(entry.elements, fonts)
      }
    }
    return fonts.sort((a, b) => (a.count < b.count) ? 1 : -1)
  },

  processElementFonts (elements, fonts) {
    for (const element of elements) {
      this.processElementFont(element.style.text?.fontFamily, fonts)
      if (element.inlineChildren?.length) {
        this.processElementFonts(element.inlineChildren, fonts)
      }
    }
  },

  processElementFont (name, fonts) {
    if (!name) return
    const found = this.getFontFromList(name, fonts)
    if (found) {
      found.count++
    } else {
      fonts.push({
        name,
        count: 1,
        url: this._baseUrl + `/font/${name.replaceAll(' ', '+')}.zip`
      })
    }
  },

  getFontFromList (name, list) {
    for (const font of list) {
      if (font.name === name) return font
    }
  },

  isGoogleFont (font, list) {
    for (const val of list) {
      if (val.family === font) return true
    }
    return false
  },

  async installGoogleFont (font, folderFonts, params) {
    if (folderFonts.includes(font.name)) {
      const msg = Language.localize('Font <b>{{font}}</b> already exists', { font: font.name })
      EventMain.ipcMainInvoke('mainImportProgress', msg, params.type)
    } else {
      const msg = Language.localize('Installing font <b>{{font}}</b>', { font: font.name })
      EventMain.ipcMainInvoke('mainImportProgress', msg, params.type)
      await Font.addFont(font.url, null, params.folder)
    }
  },

  getWeight (font) {
    if (!font) return
    for (const [name, value] of Object.entries(this.getWeights())) {
      if (font.includes(name)) return value
    }
  },

  getWeights () {
    // we want to sort them by most specific words first
    return {
      thin: 100,
      extralight: 200,
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      extrabold: 800,
      bold: 700,
      black: 900
    }
  }
}
