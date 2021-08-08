import fs from 'fs'
import fse from 'fs-extra'
import { dialog } from 'electron'
import Cookie from '../lib/Cookie.js'
import File from '../file/File.js'
import EventMain from '../event/EventMain.js'
import Plugin from '../lib/Plugin.js'
import HelperProject from '../../js/helper/HelperProject.js'
import Font from '../lib/Font.js'
import Electron from '../lib/Electron.js'
import Language from '../lib/Language.js'
import Import from '../import/Import.js'
import ProjectCommon from './ProjectCommon.js'

export default {
  // this can:
  //  - open a project
  //  - save the project settings
  //  - create a new project with settings
  //  - import a file with settings; this doesn't actually open the project
  async initProject (data) {
    const folder = data?.folder || this.getProjectFolder(data)
    if (!folder) return
    await Cookie.setCookie('currentFolder', folder)
    await File.syncUiFolder(folder)
    Font.rebuildFonts(folder)
    const settings = this.getProjectSettings(folder)
    if (data?.settings) await this.applyNewSettings(folder, settings, data.settings)
    if (data?.import) {
      await Import.importFile({ ...data.import, folder, settings })
    } else {
      EventMain.ipcMainInvoke('mainOpenProject', folder, settings)
    }
  },

  getProjectFolder (data) {
    const title = this.getDialogTitle(data)
    const folders = dialog.showOpenDialogSync(Electron.getCurrentWindow(), {
      title,
      buttonLabel: title,
      properties: ['openDirectory', 'createDirectory']
    })
    if (folders) return File.sanitizePath(folders[0])
  },

  getDialogTitle (data) {
    return data
      ? Language.localize('Save files to this empty folder')
      : Language.localize('Choose a folder project')
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
    ProjectCommon.saveProjectSettings(folder, settings)
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
    ProjectCommon.saveProjectSettings(folder, settings)
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

  async getDesignSystemCss () {
    return await Plugin.triggerPlugin('designSystem', 'getEditorCss')
  }
}
