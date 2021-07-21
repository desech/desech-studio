import fs from 'fs'
import fse from 'fs-extra'
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
    if (newSettings) await this.applyNewSettings(folder, settings, newSettings)
    EventMain.ipcMainInvoke('mainOpenProject', folder, settings)
  },

  getProjectSettings (folder) {
    const file = File.resolve(folder, '_desech/project.json')
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

  async applyNewSettings (folder, settings, newSettings) {
    if (settings.exportCode !== newSettings.exportCode) {
      await this.clearExistingExport(folder)
    }
    if (settings.responsiveType !== newSettings.responsiveType) {
      settings.responsive = this.getResponsiveData(newSettings.responsiveType)
    }
    settings.responsiveType = newSettings.responsiveType
    settings.designSystem = newSettings.designSystem
    settings.exportCode = newSettings.exportCode
    this.saveProjectSettings(folder, settings)
  },

  async clearExistingExport (folder) {
    fse.emptyDirSync(File.resolve(folder, '_export'))
    // it's not efficient to sync twice, but we need the old settings
    // so we have to sync the project.json file
    // besides, changing exports, will very rarely happen, so we don't need to optimize it
    await File.syncUiFolder(folder)
  },

  getResponsiveData (responsiveType) {
    return (responsiveType === 'desktop')
      ? HelperProject.getDesktopFirstResponsive()
      : HelperProject.getMobileFirstResponsive()
  },

  saveProjectSettings (folder, settings) {
    const file = File.resolve(folder, '_desech/project.json')
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
