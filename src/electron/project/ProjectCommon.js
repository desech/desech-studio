import fs from 'fs'
import Cookie from '../lib/Cookie.js'
import File from '../file/File.js'
import ExportCommon from '../export/ExportCommon.js'

export default {
  async getProjectSettings () {
    const folder = await Cookie.getCookie('currentFolder')
    if (!folder) return
    return File.getFileData('_desech/project.json', folder)
  },

  async getDesignSystem () {
    const settings = await this.getProjectSettings() || {}
    return settings.designSystem || false
  },

  saveProjectSettings (folder, settings) {
    const file = File.resolve(folder, '_desech/project.json')
    fs.writeFileSync(file, JSON.stringify(settings, null, 2))
  },

  async updateHtmlFiles (folder, callback) {
    const htmlFiles = ExportCommon.getHtmlFiles(folder)
    for (const file of htmlFiles) {
      const html = fs.readFileSync(file.path).toString()
      fs.writeFileSync(file.path, await callback(file.path, html))
    }
  },

  async updateCssFiles (folder, callback) {
    const files = File.readFolder(File.resolve(folder, 'css'))
    await this.loopCssFiles(files, callback)
  },

  async loopCssFiles (files, callback) {
    for (const file of files) {
      if (file.type === 'folder') {
        await this.loopCssFiles(file.children, callback)
      } else { // file
        const css = fs.readFileSync(file.path).toString()
        fs.writeFileSync(file.path, await callback(file.path, css))
      }
    }
  }
}
