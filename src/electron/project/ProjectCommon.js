import fs from 'fs'
import Cookie from '../lib/Cookie.js'
import File from '../file/File.js'

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
  }
}
