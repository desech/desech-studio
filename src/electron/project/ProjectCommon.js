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
  }
}
