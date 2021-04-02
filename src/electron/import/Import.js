import fs from 'fs'
import path from 'path'
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

export default {
  _tmpFileCss: {},

  async importFile (params) {
    const folders = this.getChooseFolder(params.locale)
    if (!folders) return
    const folder = File.sanitizePath(folders[0])
    const data = await this.getImportData({ ...params, folder })
    this.backupImportFile(folder, params.type, data)
    this.setProjectSettings(folder, data)
    const hasDesignSystem = await ProjectCommon.getDesignSystem()
    this.saveGeneralCssFiles(data.css, folder, params.locale)
    this.saveHtmlFiles(data.html, data.css, folder, folder, hasDesignSystem, params.locale)
    EventMain.ipcMainInvoke('mainImportProgress', Language.localize('Import finished',
      params.locale), folder)
  },

  getChooseFolder (locale) {
    return dialog.showOpenDialogSync(Electron.getCurrentWindow(), {
      title: Language.localize('Save files here', locale),
      buttonLabel: Language.localize('Choose folder', locale),
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

  backupImportFile (folder, type, data) {
    const file = path.resolve(folder, '_desech', type + '-import.json')
    fs.writeFileSync(file, JSON.stringify(data, null, 2))
  },

  setProjectSettings (folder, data) {
    const css = data.css.element[data.html.index.ref]
    Project.saveDefaultWidthHeight(folder, css.width, css.height)
  },

  saveHtmlFiles (html, css, folder, mainFolder, hasDesignSystem, locale) {
    for (const file of Object.values(html)) {
      const filePath = path.resolve(folder, file.name)
      if (file.type === 'folder') {
        File.createFolder(filePath)
        this.saveHtmlFiles(file.files, css, filePath, mainFolder, hasDesignSystem, locale)
      } else { // file
        this.saveHtmlFileAndCss(file, css, filePath + '.html', mainFolder, hasDesignSystem,
          locale)
      }
    }
  },

  saveHtmlFileAndCss (file, css, htmlFile, mainFolder, hasDesignSystem, locale) {
    const html = this.getHtml(file, css, htmlFile, mainFolder, hasDesignSystem, locale)
    fs.writeFileSync(htmlFile, html)
    const pageCssFile = HelperFile.getPageCssFile(htmlFile, mainFolder)
    const pageCss = this.prepareCss(this._tmpFileCss)
    FileSave.saveStyleToFile(pageCss, css.color, mainFolder, `css/page/${pageCssFile}`)
  },

  getHtml (data, css, file, folder, hasDesignSystem, locale) {
    const msg = Language.localize('Saving html file <b>{{file}}</b>', locale,
      { file: path.basename(file) })
    EventMain.ipcMainInvoke('mainImportProgress', msg)
    const html = this.getImportHtml(data, css, folder, locale)
    return HelperFile.getFullHtml(file, FileParse.beautifyHtml(html), {}, folder, hasDesignSystem)
  },

  getImportHtml (data, css, folder, locale) {
    if (!data.nodes) return ''
    const body = ImportPosition.buildStructure(data.nodes, data.ref, css)
    if (data.nodes.length) {
      const msg = Language.localize('<span class="error">{{count}} element(s) have been ignored</span>',
        locale, { count: data.nodes.length })
      EventMain.ipcMainInvoke('mainImportProgress', msg)
    }
    this._tmpFileCss = {}
    return this.getHtmlNode(body, css, folder)
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
      ? this.getHtmlNodes(node.children, css, folder) : node.content
    if (node.type === 'block' && node.content) this.saveSvgBgImage(node, css, folder)
    return `<${tag} class="${cls}"${href}>${children}</${tag}>`
  },

  getHtmlNodes (nodes, css, folder) {
    let body = ''
    for (const node of nodes) {
      body += this.getHtmlNode(node, css, folder)
    }
    return body
  },

  addNodeCss (node, css) {
    if (!css.element[node.ref]) return
    this._tmpFileCss[node.ref] = css.element[node.ref]
    // we prefer to manually set these values in desech
    if (node.type !== 'icon') delete this._tmpFileCss[node.ref].width
    if (this._tmpFileCss[node.ref]['font-size'] === '16px') {
      delete this._tmpFileCss[node.ref]['font-size']
    }
    if (node.name !== 'body') {
      delete this._tmpFileCss[node.ref]['font-family']
    }
    const ignored = ['height', 'align-self', 'justify-self', 'text-align']
    for (const prop of ignored) {
      delete this._tmpFileCss[node.ref][prop]
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
    this.deleteDivConvertCss(node.ref, css)
  },

  getScaledSrcset (image, scale) {
    const ext = path.extname(image)
    return image.replace(ext, `@${scale}x${ext} ${scale}x`)
  },

  deleteDivConvertCss (ref, css) {
    const deleteProps = [...ParseCommon.getBackgroundProperties(), 'height']
    for (const name of deleteProps) {
      delete css.element[ref][name]
    }
  },

  saveSvgBgImage (node, css, folder) {
    const file = `${ParseCommon.getName(node.name)}-${node.width}-${node.height}.svg`
    const filePath = path.resolve(folder, 'asset/image', file)
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, node.content)
    this.addSvgBgImageCss(node.ref, file, css)
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
    const html = node.content.replace('<svg ', `<svg class="${cls}" `)
    return html.replace(' fill="none"', '').replace(' xmlns="http://www.w3.org/2000/svg"', '')
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

  saveGeneralCssFiles (css, folder, locale) {
    EventMain.ipcMainInvoke('mainImportProgress', Language.localize('Saving css files', locale))
    File.createFolder(folder, 'css')
    File.createFolder(folder, 'font')
    // we no longer import components, so no need to save them
    // FileSave.saveStyleToFile(this.prepareCss(css.component), css.color, folder,
    //   'css/general/component-css.css')
    // we also don't import fonts, so not much to do here
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
