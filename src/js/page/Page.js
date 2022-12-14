import HelperTrigger from '../helper/HelperTrigger.js'
import HelperLocalStore from '../helper/HelperLocalStore.js'
import HelperDOM from '../helper/HelperDOM.js'
import TopCommandSave from '../main/top/command/TopCommandSave.js'
import DialogComponent from '../component/DialogComponent.js'
import HelperProject from '../helper/HelperProject.js'
import Project from '../start/Project.js'
import TopZoom from '../main/top/TopZoom.js'
import TopCommon from '../main/top/TopCommon.js'
import LeftFileLoad from '../main/left/file/LeftFileLoad.js'
import HelperCanvas from '../helper/HelperCanvas.js'

export default {
  loadStart () {
    this.loadPage('start')
    HelperLocalStore.clearStore()
  },

  loadPage (page) {
    DialogComponent.closeAllDialogs()
    this.addPageContainer(page)
  },

  addPageContainer (page) {
    const container = document.getElementById('page')
    const template = HelperDOM.getTemplate(`template-page-${page}`)
    HelperDOM.replaceOnlyChild(container, template)
  },

  async loadMain (file = null) {
    // save first before loading a new file
    if (file) await TopCommandSave.save(true)
    this.loadPage('main')
    HelperTrigger.triggerReload('responsive-mode-list')
    this.addCssFiles()
    HelperLocalStore.removeAllTemporary()
    this.loadMainFilePanel(file)
    TopZoom.setSavedZoomLevel()
    TopCommon.positionDragHandle()
  },

  addCssFiles () {
    Project.addProjectFontCss()
    Project.addDesignSystemCss()
  },

  loadMainFilePanel (file) {
    // this is async because of Left.openpanelEvent()
    HelperTrigger.triggerOpenPanel('panel-button-file', {
      force: true,
      loadFile: file || HelperProject.getFolder() + '/index.html',
      projectSave: !file
    })
  },

  setIntervals () {
    TopCommandSave.setAutoSaveInterval()
  },

  async loadFile (file) {
    // save first before loading a new file
    await TopCommandSave.save(true)
    await LeftFileLoad.loadFile(file)
    HelperTrigger.triggerClosePanel('panel-button-file')
    HelperCanvas.scrollToTop()
  }
}
