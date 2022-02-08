import File from './File.js'
import Plugin from '../lib/Plugin.js'
import ParseCssMerge from './parse/ParseCssMerge.js'
import HelperFile from '../../js/helper/HelperFile.js'
import ProjectCommon from '../project/ProjectCommon.js'
import ExportStaticCode from '../export/ExportStaticCode.js'
import ExportCommon from '../export/ExportCommon.js'
import ExportData from '../export/ExportData.js'
import Variable from '../lib/Variable.js'

export default {
  async saveCurrentFile (data) {
    // check TopCommandSave.getCurrentFileData() for data
    Variable.saveVariables(data.global.variables, data.folder)
    await File.saveFileWithBackup(data.htmlFile, data.html)
    await this.saveStyle(data.css, data.htmlFile, data.folder)
    await this.exportCode(data)
  },

  async saveStyle (css, htmlFile, folder) {
    await this.saveStyleToFile(css.variable, folder, 'css/general/root.css')
    await this.saveStyleToFile(css.componentCss, folder, 'css/general/component-css.css')
    await this.saveStyleToFile(css.componentHtml, folder, 'css/general/component-html.css')
    await this.savePageStyle(css, htmlFile, folder)
  },

  async savePageStyle (css, htmlFile, folder) {
    if (HelperFile.isPageFile(htmlFile, folder)) {
      const pageCssFile = HelperFile.getPageCssFile(htmlFile, folder)
      await this.saveStyleToFile(css.element, folder, `css/page/${pageCssFile}`)
    }
  },

  async saveStyleToFile (data, folder, file) {
    const filePath = File.resolve(folder, file)
    const css = this.getStyle(data)
    await File.saveFileWithBackup(filePath, css)
  },

  getStyle (data) {
    let css = ''
    for (const rule of data) {
      if (!rule.length) continue
      if (css) css += '\n'
      css += this.addRule(rule[0], this.getProperties(rule))
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

  getProperties (rule) {
    const properties = this.getParsedProperties(rule)
    let css = ''
    for (const [name, prop] of Object.entries(properties)) {
      css += prop.responsive ? '\n    ' : '\n  '
      css += `${name}: ${prop.value};`
    }
    return css
  },

  getParsedProperties (rule) {
    const properties = {}
    for (const prop of rule) {
      if (!prop.property || !prop.value) continue
      properties[prop.property] = {
        responsive: prop.responsive || null,
        value: prop.value
      }
    }
    if (rule.length && rule[0].selector === ':root') return properties
    return ParseCssMerge.mergeProperties(properties)
  },

  async exportCode (data) {
    this.prepareDataForExport(data)
    const project = await ProjectCommon.getProjectSettings()
    if (project.exportCode === 'static') {
      await ExportStaticCode.saveToFile(data)
    } else if (project.exportCode) {
      data.component = ExportData.getAllComponentData(data.htmlFiles, data.folder)
      await Plugin.triggerPlugin('exportCode', 'saveToFile', data)
    }
  },

  prepareDataForExport (data) {
    data.compiledCss = ExportCommon.getCompiledCss(data.folder)
    data.htmlFiles = ExportCommon.getHtmlFiles(data.folder)
    data.rootMiscFiles = ExportCommon.getRootMiscFiles(data.folder, data.htmlFiles)
  }
}
