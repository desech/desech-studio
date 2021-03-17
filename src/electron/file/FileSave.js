import fs from 'fs'
import path from 'path'
import os from 'os'
import { shell } from 'electron'
import Plugin from '../lib/Plugin.js'
import ParseCssMerge from './parse/ParseCssMerge.js'
import HelperFile from '../../js/helper/HelperFile.js'
import HelperProject from '../../js/helper/HelperProject.js'
import ProjectCommon from '../project/ProjectCommon.js'
import ExportStaticCode from '../export/ExportStaticCode.js'

export default {
  async saveCurrentFile (data) {
    // check TopCommandSave.getCurrentFileData() for data
    this.saveFileWithBackup(data.htmlFile, data.html)
    this.saveStyle(data.css, data.htmlFile, data.folder)
    await Plugin.triggerPlugin('designSystem', 'saveToFile', data)
    await this.exportCode(data)
  },

  saveFileWithBackup (file, contents) {
    if (fs.existsSync(file)) {
      file = HelperFile.convertPathForWin(file, os.platform())
      shell.moveItemToTrash(file)
    }
    fs.writeFileSync(file, contents)
  },

  saveStyle (css, htmlFile, folder) {
    this.saveStyleToFile(css.color, css.color, folder, 'css/general/root.css')
    this.saveStyleToFile(css.componentCss, css.color, folder, 'css/general/component-css.css')
    this.saveComponentHtmlStyle(css, htmlFile, folder)
    this.saveElementStyle(css, htmlFile, folder)
  },

  saveStyleToFile (data, colors, folder, file) {
    const filePath = path.resolve(folder, file)
    const css = this.getStyle(data, colors)
    this.saveFileWithBackup(filePath, css)
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

  saveComponentHtmlStyle (css, htmlFile, folder) {
    // don't save it when we are not in a component file
    if (!HelperProject.isFileComponent(htmlFile)) return
    this.saveStyleToFile(css.componentHtml, css.color, folder, 'css/general/component-html.css')
  },

  saveElementStyle (css, htmlFile, folder) {
    // don't save it when we are in a component file
    if (HelperProject.isFileComponent(htmlFile)) return
    const pageCssFile = HelperFile.getPageCssFile(htmlFile, folder)
    this.saveStyleToFile(css.element, css.color, folder, `css/page/${pageCssFile}`)
  },

  async exportCode (data) {
    const project = await ProjectCommon.getProjectSettings()
    if (project.exportCode === 'static') {
      await ExportStaticCode.saveToFile(data)
    } else if (project.exportCode) {
      await Plugin.triggerPlugin('exportCode', 'saveToFile', data)
    }
  }
}
