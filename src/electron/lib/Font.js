import fs from 'fs'
import AdmZip from 'adm-zip'
import Cookie from './Cookie.js'
import File from '../file/File.js'
import Fetch from './Fetch.js'

export default {
  async addFont (url, file, folder = null) {
    if (!url && !file) return false
    folder = folder || await Cookie.getCookie('currentFolder')
    const zip = await this.copyFontFolder(folder, url, file)
    const css = this.getFontCss(folder, zip)
    this.addFontCss(folder, css)
    return true
  },

  async copyFontFolder (folder, url, file) {
    const buffer = await this.getZipFile(url, file)
    const zip = new AdmZip(buffer)
    const fontDir = File.resolve(folder, 'font')
    zip.extractAllTo(fontDir, true)
    return zip
  },

  async getZipFile (url, file) {
    return url ? await Fetch.fetch(url, 'buffer') : fs.readFileSync(file)
  },

  getFontCss (folder, zip) {
    for (const entry of zip.getEntries()) {
      if (File.basename(entry.entryName) === 'font.css') {
        return zip.readAsText(entry)
      }
    }
    throw new Error('Css file "font.css" not found inside the zip file')
  },

  addFontCss (folder, css) {
    const file = File.resolve(folder, 'css/general/font.css')
    fs.appendFileSync(file, css + '\n\n')
  },

  rebuildFonts (folder) {
    const css = this.getAllFontCss(folder)
    const file = File.resolve(folder, 'css/general/font.css')
    fs.writeFileSync(file, css)
  },

  getAllFontCss (folder) {
    let css = ''
    const files = File.readFolder(File.resolve(folder, 'font'))
    for (const entry of files) {
      if (entry.type !== 'folder') continue
      for (const file of entry.children) {
        if (file.name !== 'font.css') continue
        const fileCss = fs.readFileSync(file.path).toString()
        css += fileCss + '\n\n'
      }
    }
    return css
  },

  getFontsList (folder) {
    const list = []
    const files = File.readFolder(File.resolve(folder, 'font'))
    for (const entry of files) {
      if (entry.type === 'folder') {
        list.push(entry.name.replaceAll('+', ' '))
      }
    }
    return list
  }
}
