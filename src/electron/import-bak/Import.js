import fs from 'fs'
import fetch from 'node-fetch'
import { dialog } from 'electron'
import Language from '../lib/Language.js'
import Figma from './Figma.js'
import File from '../file/File.js'
import HelperFile from '../../js/helper/HelperFile.js'
import FileSave from '../file/FileSave.js'
import ImportPosition from './ImportPosition.js'
import Adobexd from './Adobexd.js'
import Sketch from './Sketch.js'
import ProjectCommon from '../project/ProjectCommon.js'
import EventMain from '../event/EventMain.js'
import Project from '../project/Project.js'
import ParseCommon from './ParseCommon.js'
import HelperStyle from '../../js/helper/HelperStyle.js'
import Electron from '../lib/Electron.js'
import FileParse from '../file/FileParse.js'
import ExtendJS from '../../js/helper/ExtendJS.js'
import Font from '../lib/Font.js'

export default {
  _tmpFileCss: {},
  _type: null,
  _svgImageNames: [],

  async importFile (params) {
    this._type = params.type
    const folders = this.getChooseFolder()
    if (!folders) return
    const folder = File.sanitizePath(folders[0])
    const data = await this.getImportData({ ...params, folder })
    this.backupImportFile(folder, data)
    if (ExtendJS.isEmpty(data.html)) {
      throw new Error(Language.localize('There are no valid top level visible elements to be imported'))
    }
    this.setProjectSettings(folder, data)
    const hasDesignSystem = await ProjectCommon.getDesignSystem()
    await this.saveGeneralCssFiles(data.css, folder)
    this.saveHtmlFiles(data.html, data.css, folder, folder, hasDesignSystem)
    EventMain.ipcMainInvoke('mainImportProgress', Language.localize('Import finished'), folder)
  },

  getChooseFolder () {
    return dialog.showOpenDialogSync(Electron.getCurrentWindow(), {
      title: Language.localize('Save files to this empty folder'),
      buttonLabel: Language.localize('Save files to this empty folder'),
      properties: ['openDirectory', 'createDirectory']
    })
  },

  async getImportData (data) {
    switch (data.type) {
      case 'figma':
        return await Figma.getImportData(data)
      case 'sketch':
        return await Sketch.getImportData(data.file, data.folder)
      case 'adobexd':
        return await Adobexd.getImportData(data.file, data.folder)
      default:
        throw new Error(`Unknown import type ${data.type}`)
    }
  },

  backupImportFile (folder, data) {
    const file = File.resolve(folder, '_desech', this._type + '-import.json')
    fs.writeFileSync(file, JSON.stringify(data, null, 2))
  },

  setProjectSettings (folder, data) {
    const css = data.css.element[data.html.index.ref]
    Project.saveDefaultWidthHeight(folder, css.width, css.height)
  },

  saveHtmlFiles (html, css, folder, mainFolder, hasDesignSystem) {
    for (const file of Object.values(html)) {
      const filePath = File.resolve(folder, file.name)
      if (file.type === 'folder') {
        File.createFolder(filePath)
        this.saveHtmlFiles(file.files, css, filePath, mainFolder, hasDesignSystem)
      } else {
        // file
        this.saveHtmlFileAndCss(file, css, filePath + '.html', mainFolder, hasDesignSystem)
      }
    }
  },

  saveHtmlFileAndCss (file, css, htmlFile, mainFolder, hasDesignSystem) {
    const html = this.getHtml(file, css, htmlFile, mainFolder, hasDesignSystem)
    fs.writeFileSync(htmlFile, html)
    const pageCssFile = HelperFile.getPageCssFile(htmlFile, mainFolder)
    const pageCss = this.prepareCss(this._tmpFileCss)
    FileSave.saveStyleToFile(pageCss, css.color, mainFolder, `css/page/${pageCssFile}`)
  },

  getHtml (data, css, file, folder, hasDesignSystem) {
    const msg = Language.localize('Saving html file <b>{{file}}</b>',
      { file: File.basename(file) })
    EventMain.ipcMainInvoke('mainImportProgress', msg)
    const html = this.getImportHtml(data, css, folder)
    const beauty = FileParse.beautifyHtml(html)
    return HelperFile.getFullHtml(file, beauty, {}, folder, hasDesignSystem)
  },

  getImportHtml (data, css, folder) {
    if (!data.nodes) return ''
    const body = ImportPosition.buildStructure(data.nodes, data.ref, css)
    if (data.nodes.length) {
      const msg = Language.localize('<span class="error">{{count}} element(s) have been ignored - {{elements}}</span>',
        { count: data.nodes.length, elements: this.getIgnoredElements(data.nodes) })
      EventMain.ipcMainInvoke('mainImportProgress', msg)
    }
    this._tmpFileCss = {}
    return this.getHtmlNode(body, css, folder)
  },

  getIgnoredElements (nodes) {
    const names = []
    for (const node of nodes) {
      names.push('"' + node.name + '"')
    }
    return names.join(', ')
  },

  getHtmlNode (node, css, folder) {
    if (this.shouldConvertDiv(node, css)) this.convertDivToImg(node, css, folder)
    this.addNodeCss(node, css)
    const cls = this.getClasses(node)
    if (node.type === 'image') return this.getImageNode(node, css, cls)
    if (node.type === 'icon') return this.getIconNode(node, cls)
    const tag = node.tag || this.getHtmlTag(node.type)
    const href = node.href ? ` href="${node.href}"` : ''
    const children = (node.children && node.children.length)
      ? this.getHtmlNodes(node, node.children, css, folder)
      : node.content
    if (node.type === 'block' && node.content) this.saveSvgBgImage(node, css, folder)
    return `<${tag} class="${cls}"${href}>${children}</${tag}>`
  },

  getHtmlNodes (parent, nodes, css, folder) {
    let body = ''
    for (const node of nodes) {
      node.parentRef = parent.ref
      body += this.getHtmlNode(node, css, folder)
    }
    return body
  },

  // filter out some properties
  addNodeCss (node, css) {
    if (!css.element[node.ref]) return
    this._tmpFileCss[node.ref] = css.element[node.ref]
    if (node.tag === 'hr') delete this._tmpFileCss[node.ref].height
    this.filterTextCss(node, css)
    this.setTextAlignmentCss(node, css)
  },

  filterTextCss (node, css) {
    // skip default font size 16px
    if (this._tmpFileCss[node.ref]['font-size'] === '16px') {
      delete this._tmpFileCss[node.ref]['font-size']
    }
    // skip default black text color
    if (this._tmpFileCss[node.ref].color === 'rgb(0, 0, 0)') {
      delete this._tmpFileCss[node.ref].color
    }
    if (node.type === 'text') this.addInlineCss(node, css)
  },

  addInlineCss (node, css) {
    const refs = this.getClassesFromHtml(node.content)
    for (const ref of refs) {
      this.addNodeCss({ ref, type: 'inline' }, css)
    }
  },

  getClassesFromHtml (html) {
    const classes = []
    const regex = html.matchAll(/class="(.*?)"/g)
    for (const match of regex) {
      classes.push(match[1])
    }
    return classes
  },

  setTextAlignmentCss (node, css) {
    // if we all our children have the same text-alignment then set it on the parent
    if (node.children && node.children.length) {
      this.setTextAlignmentToParent(node, css)
    }
    // if our parent has a text-alignment then our children don't need it anymore
    if (this._tmpFileCss[node.parentRef] && this._tmpFileCss[node.parentRef]['text-align']) {
      delete this._tmpFileCss[node.ref]['text-align']
    }
  },

  setTextAlignmentToParent (node, css) {
    let value = null
    for (const child of node.children) {
      if (!css.element[child.ref] || !css.element[child.ref]['text-align'] ||
        (value && value !== css.element[child.ref]['text-align'])) {
        return
      }
      value = css.element[child.ref]['text-align']
    }
    this._tmpFileCss[node.ref]['text-align'] = value
  },

  shouldConvertDiv (node, css) {
    return (node.type === 'block' && !node.children.length && css.element[node.ref] &&
      css.element[node.ref]['background-image'] &&
      /^url\([^,]*?\)$/.test(css.element[node.ref]['background-image']))
  },

  convertDivToImg (node, css, folder) {
    node.type = 'image'
    const image = css.element[node.ref]['background-image'].replace('url("../', '')
      .replace('")', '')
    node.srcset = `${image} 1x, ${this.getScaledSrcset(image, 2)}, ` +
      `${this.getScaledSrcset(image, 3)}`
    this.wipeCssOnBackgroundImage(node.ref, css)
  },

  getScaledSrcset (image, scale) {
    const ext = File.extname(image)
    return image.replace(ext, `@${scale}x${ext} ${scale}x`)
  },

  wipeCssOnBackgroundImage (ref, css) {
    // figma also exports the effects, borders, etc on images, so we don't need the extra css
    // but for sketch and xd we need to remove the background css properties and the svg strokes
    for (const name of Object.keys(css.element[ref])) {
      if ((this._type === 'figma' && !['width', 'height'].includes(name)) ||
        (this._type !== 'figma' && (name.startsWith('background-') ||
          name.startsWith('stroke')))) {
        delete css.element[ref][name]
      }
    }
  },

  saveSvgBgImage (node, css, folder) {
    const file = ParseCommon.getSvgName(node, this._svgImageNames) + '.svg'
    const filePath = File.resolve(folder, 'asset/image', file)
    this.addSvgCssToContent(node, css)
    fs.writeFileSync(filePath, node.content)
    this.wipeCssOnBackgroundImage(node.ref, css)
    this.addSvgBgImageCss(node.ref, file, css)
  },

  addSvgCssToContent (node, css) {
    // figma no longer has css properties for svgs
    // when dealing with svg bg images, copy back the css to the svg attributes
    if (!css.element[node.ref]) return
    const attrs = []
    for (const prop of ['fill', 'stroke', 'stroke-width', 'stroke-dasharray']) {
      if (css.element[node.ref][prop]) {
        attrs.push(`${prop}="${css.element[node.ref][prop]}"`)
      }
    }
    if (!attrs.length) return
    // we want replace not relaceAll because we only want the first node to be affected
    node.content = node.content.replace(/<(polygon|path)/gi, `<$1 ${attrs.join(' ')}`)
  },

  addSvgBgImageCss (ref, file, css) {
    css.element[ref]['background-image'] = `url("../../asset/image/${file}")`
    css.element[ref]['background-size'] = 'contain'
    css.element[ref]['background-repeat'] = 'no-repeat'
    const properties = ['background-blend-mode', 'background-position', 'background-attachment',
      'background-origin']
    for (const name of properties) {
      css.element[ref][name] = HelperStyle.getDefaultProperty(name)
    }
  },

  getImageNode (node, css, cls) {
    return `<img class="${cls}" srcset="${node.srcset}">`
  },

  getIconNode (node, cls) {
    // imported svgs sometimes have elements without content
    if (!node.content) return ''
    return node.content.replace('<svg ', `<svg class="${cls}" `)
      .replace(/(<svg.*?) width=".*?"/, '$1')
      .replace(/(<svg.*?) height=".*?"/, '$1')
  },

  getHtmlTag (type) {
    switch (type) {
      case 'block':
        return 'div'
      case 'text':
        return 'p'
      case 'icon':
        return 'svg'
      case 'image':
        return 'img'
    }
  },

  getClasses (node) {
    let cls = node.ref
    if (node.type === 'block' || node.type === 'text') cls += ' ' + node.type
    cls += ' ' + node.component.join(' ')
    return cls.trim()
  },

  async saveGeneralCssFiles (css, folder) {
    EventMain.ipcMainInvoke('mainImportProgress', Language.localize('Saving css files'))
    File.createFolder(folder, 'css')
    File.createFolder(folder, 'font')
    await this.installFonts(css, folder)
    // we no longer import components, so no need to save them
    // FileSave.saveStyleToFile(this.prepareCss(css.component), css.color, folder,
    //   'css/general/component-css.css')
  },

  async installFonts (css, folder) {
    css.font.sort((a, b) => (a.count < b.count) ? 1 : -1)
    const webFonts = await this.fetchFonts()
    const folderFonts = Font.getFontsList(folder)
    for (const val of css.font) {
      if (this.isGoogleFont(val.name, webFonts)) {
        await this.installGoogleFont(val, folder, folderFonts)
      } else {
        const msg = Language.localize('<span class="error">Local font <b>{{font}}</b> is ignored</span>',
          { font: val.name })
        EventMain.ipcMainInvoke('mainImportProgress', msg)
      }
    }
  },

  async fetchFonts () {
    const response = await fetch('https://download.desech.com/font/list.json')
    if (!response.ok) throw new Error("Can't access download.desech.com")
    return await response.json()
  },

  isGoogleFont (font, list) {
    for (const val of list) {
      if (val.family === font) return true
    }
    return false
  },

  async installGoogleFont (font, folder, folderFonts) {
    if (folderFonts.includes(font.name)) {
      const msg = Language.localize('Font <b>{{font}}</b> already exists', { font: font.name })
      EventMain.ipcMainInvoke('mainImportProgress', msg)
    } else {
      const msg = Language.localize('Installing font <b>{{font}}</b>', { font: font.name })
      EventMain.ipcMainInvoke('mainImportProgress', msg)
      await Font.addFont(font.url, null, folder)
    }
  },

  prepareCss (css) {
    const data = []
    for (const [key, obj] of Object.entries(css)) {
      data.push(this.prepareCssRecord(key, obj))
    }
    return data
  },

  prepareCssRecord (key, obj) {
    const record = []
    for (const [property, value] of Object.entries(obj)) {
      record.push({ selector: '.' + key, property, value })
    }
    return record
  }
}
