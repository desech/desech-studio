import ElectronCommon from './ElectronCommon.js'
import DialogComponent from '../component/DialogComponent.js'
import Page from '../page/Page.js'
import Project from '../start/Project.js'
import HelperProject from '../helper/HelperProject.js'

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
    window.electron.on('mainNewProject', (event, plugins) => {
      ElectronCommon.handleEvent(Project, 'newProject', plugins)
    })
  },

  mainOpenProjectEvent () {
    window.electron.on('mainOpenProject', (event, folder, settings) => {
      ElectronCommon.handleEvent(this, 'openProject', folder, settings)
    })
  },

  mainCloseProjectEvent () {
    window.electron.on('mainCloseProject', (event) => {
      ElectronCommon.handleEvent(this, 'closeProject')
    })
  },

  mainOpenProjectSettingsEvent () {
    window.electron.on('mainOpenProjectSettings', (event, settings, plugins) => {
      ElectronCommon.handleEvent(Project, 'openProjectSettings', settings, plugins)
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

  async openProject (folder, settings) {
    HelperProject.setFolder(folder)
    HelperProject.setProjectSettings(settings)
    await Page.loadMain()
  },

  closeProject () {
    HelperProject.clearData()
    Page.loadStart()
  }
}
