import ElectronCommon from './ElectronCommon.js'
import DialogComponent from '../component/DialogComponent.js'
import Page from '../page/Page.js'
import Project from '../start/Project.js'
import HelperProject from '../helper/HelperProject.js'
import HelperGlobal from '../helper/HelperGlobal.js'

export default {
  addEvents () {
    this.mainShortcutsEvent()
    this.mainAboutEvent()
    this.mainNewProjectEvent()
    this.mainOpenProjectEvent()
    this.mainCloseProjectEvent()
    this.mainOpenProjectSettingsEvent()
  },

  mainShortcutsEvent () {
    window.electron.on('mainShortcuts', (event) => {
      ElectronCommon.handleEvent(this, 'showShortcuts')
    })
  },

  mainAboutEvent () {
    window.electron.on('mainAbout', (event) => {
      ElectronCommon.handleEvent(this, 'showAbout')
    })
  },

  mainNewProjectEvent () {
    window.electron.on('mainNewProject', (event, importData) => {
      ElectronCommon.handleEvent(Project, 'newProject', importData)
    })
  },

  mainOpenProjectEvent () {
    window.electron.on('mainOpenProject', (event, data) => {
      ElectronCommon.handleEvent(this, 'openProject', data)
    })
  },

  mainCloseProjectEvent () {
    window.electron.on('mainCloseProject', (event) => {
      ElectronCommon.handleEvent(this, 'closeProject')
    })
  },

  mainOpenProjectSettingsEvent () {
    window.electron.on('mainOpenProjectSettings', (event, settings) => {
      ElectronCommon.handleEvent(Project, 'openProjectSettings', settings)
    })
  },

  showShortcuts () {
    DialogComponent.showDialog({
      header: DialogComponent.getContentHtml('shortcuts', 'header'),
      body: DialogComponent.getContentHtml('shortcuts', 'body')
    })
  },

  showAbout () {
    DialogComponent.showDialog({
      header: DialogComponent.getContentHtml('about', 'header'),
      body: DialogComponent.getContentHtml('about', 'body')
    })
  },

  async openProject (data) {
    HelperProject.setFolder(data.folder)
    HelperProject.setProjectSettings(data.settings)
    HelperGlobal.setVariables(data.variables)
    await Page.loadMain()
  },

  closeProject () {
    HelperProject.clearData()
    Page.loadStart()
  }
}
