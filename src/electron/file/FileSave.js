import fs from 'fs'
import Plugin from '../lib/Plugin.js'
import ParseCssMerge from './parse/ParseCssMerge.js'
import HelperFile from '../../js/helper/HelperFile.js'
import ProjectCommon from '../project/ProjectCommon.js'
import ExportStaticCode from '../export/ExportStaticCode.js'
import ExportCommon from '../export/ExportCommon.js'
import File from './File.js'

export default {
  async saveCurrentFile (data) {
    // check TopCommandSave.getCurrentFileData() for data
    await this.saveFileWithBackup(data.htmlFile, data.html)
    await this.saveStyle(data.css, data.htmlFile, data.folder)
    await this.exportCode(data)
  },

  async saveFileWithBackup (file, contents) {
    await File.sendToTrash(file)
    fs.writeFileSync(file, contents)
  },

  async saveStyle (css, htmlFile, folder) {
    await this.saveStyleToFile(css.color, css.color, folder, 'css/general/root.css')
    await this.saveStyleToFile(css.componentCss, css.color, folder,
      'css/general/component-css.css')
    await this.saveStyleToFile(css.componentHtml, css.color, folder,
      'css/general/component-html.css')
    await this.savePageStyle(css, htmlFile, folder)
  },

  async savePageStyle (css, htmlFile, folder) {
    if (HelperFile.isPageFile(htmlFile, folder)) {
      const pageCssFile = HelperFile.getPageCssFile(htmlFile, folder)
      await this.saveStyleToFile(css.element, css.color, folder, `css/page/${pageCssFile}`)
    }
  },

  async saveStyleToFile (data, colors, folder, file) {
    const filePath = File.resolve(folder, file)
    const css = this.getStyle(data, colors)
    await this.saveFileWithBackup(filePath, css)
  },

  getStyle (data, colors = null) {
    let css = ''
    for (const rule of data) {
      if (!rule.length) continue
      if (css) css += '\n'
      css += this.addRule(rule[0], this.getProperties(rule, colors))
    }
    return css
  },

  addRule (data, properties) {
    let css = this.getTemplate(data.responsive)
    if (data.responsive) css = css.replace('$responsive', data.responsive)
    css = css.replace('$selector', data.selector)
    css = css.replace('$properties', properties)
    return css
  },

  getTemplate (responsive) {
    if (responsive) {
      return '@media $responsive {\n  $selector {$properties\n  }\n}\n'
    } else {
      return '$selector {$properties\n}\n'
    }
  },

  getProperties (rule, colors) {
    const properties = this.getParsedProperties(rule, colors)
    let css = ''
    for (const [name, prop] of Object.entries(properties)) {
      css += prop.responsive ? '\n    ' : '\n  '
      css += `${name}: ${prop.value};`
    }
    return css
  },

  getParsedProperties (rule, colors) {
    const properties = {}
    for (const prop of rule) {
      if (!prop.property || !prop.value) continue
      properties[prop.property] = {
        responsive: prop.responsive || null,
        value: prop.value
      }
    }
    if (rule.length && rule[0].selector === ':root') return properties
    return ParseCssMerge.mergeProperties(properties, colors)
  },

  async exportCode (data) {
    this.prepareDataForExport(data)
    const project = await ProjectCommon.getProjectSettings()
    if (project.exportCode === 'static') {
      await ExportStaticCode.saveToFile(data)
    } else if (project.exportCode) {
      await Plugin.triggerPlugin('exportCode', 'saveToFile', data)
    }
  },

  prepareDataForExport (data) {
    data.compiledCss = ExportCommon.getCompiledCss(data.folder)
    data.htmlFiles = ExportCommon.getHtmlFiles(data.folder)
    data.rootMiscFiles = ExportCommon.getRootMiscFiles(data.folder, data.htmlFiles)
  }
}
