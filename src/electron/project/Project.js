import path from 'path'
import fs from 'fs'
import Cookie from '../lib/Cookie.js'
import File from '../file/File.js'
import EventMain from '../event/EventMain.js'
import Plugin from '../lib/Plugin.js'
import HelperProject from '../../js/helper/HelperProject.js'
import Font from '../lib/Font.js'

export default {
  async openProject (folder, newSettings = null) {
    await Cookie.setCookie('currentFolder', folder)
    await File.syncUiFolder(folder)
    Font.rebuildFonts(folder)
    const settings = this.getProjectSettings(folder)
    if (newSettings) this.applyNewSettings(folder, settings, newSettings)
    EventMain.ipcMainInvoke('mainOpenProject', folder, settings)
  },

  getProjectSettings (folder) {
    const file = path.resolve(folder, '_desech/project.json')
    if (fs.existsSync(file) && fs.statSync(file).size) {
      return File.getFileData('_desech/project.json', folder)
    } else {
      return this.initSettingsFile(folder)
    }
  },

  initSettingsFile (folder) {
    const settings = {
      responsiveType: 'desktop',
      designSystem: '',
      exportCode: 'static',
      responsive: this.getResponsiveData('desktop')
    }
    this.saveProjectSettings(folder, settings)
    return settings
  },

  applyNewSettings (folder, settings, newSettings) {
    if (settings.responsiveType !== newSettings.responsiveType) {
      settings.responsive = this.getResponsiveData(newSettings.responsiveType)
    }
    settings.responsiveType = newSettings.responsiveType
    settings.designSystem = newSettings.designSystem
    settings.exportCode = newSettings.exportCode
    this.saveProjectSettings(folder, settings)
  },

  getResponsiveData (responsiveType) {
    return (responsiveType === 'desktop')
      ? HelperProject.getDesktopFirstResponsive()
      : HelperProject.getMobileFirstResponsive()
  },

  saveProjectSettings (folder, settings) {
    const file = path.resolve(folder, '_desech/project.json')
    fs.writeFileSync(file, JSON.stringify(settings, null, 2))
  },

  saveDefaultWidthHeight (folder, width, height) {
    const settings = this.getProjectSettings(folder)
    settings.responsive.default.width = width
    settings.responsive.default.height = height
    this.saveProjectSettings(folder, settings)
  },

  async getDesignSystemCss () {
    return await Plugin.triggerPlugin('designSystem', 'getEditorCss')
  }
}
