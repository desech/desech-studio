import HelperEvent from '../helper/HelperEvent.js'
import HelperDOM from '../helper/HelperDOM.js'
import HelperTrigger from '../helper/HelperTrigger.js'
import LeftFileData from './left/file/LeftFileData.js'
import LeftElementData from './left/element/LeftElementData.js'
import HelperCanvas from '../helper/HelperCanvas.js'
import HelperError from '../helper/HelperError.js'

export default {
  getList () {
    return {
      file: LeftFileData,
      element: LeftElementData
      // @todo add a library tab to see the rendered components and drag and drop them
      // to the canvas; have plugins that will add material design icons, etc
    }
  },

  getKeyMap () {
    return {
      1: 'file',
      2: 'element'
    }
  },

  getEvents () {
    return {
      openpanel: ['openpanelEvent'],
      reloadcontainer: ['reloadcontainerEvent'],
      click: ['clickTogglePanelEvent'],
      keydown: ['keydownTogglePanelEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  openpanelEvent (event) {
    if (event.target.classList.contains('panel-list-button')) {
      this.openPanel(event.target, event.detail || {})
    }
  },

  reloadcontainerEvent (event) {
    if (event.target.id === 'sidebar-left-panel') {
      this.reloadPanel(event.target, event.detail)
    }
  },

  clickTogglePanelEvent (event) {
    if (event.target.closest('.panel-list-button')) {
      this.togglePanel(event.target.closest('.panel-list-button').dataset.panel)
    }
  },

  keydownTogglePanelEvent (event) {
    if (event.key && HelperEvent.areMainShortcutsAllowed(event) &&
      HelperEvent.isNotCtrlAltShift(event) && !HelperCanvas.isPreview() &&
      Object.keys(this.getKeyMap()).includes(event.key)) {
      this.togglePanel(this.getKeyMap()[event.key])
    }
  },

  openPanel (button, options) {
    if (options.force || !button.classList.contains('selected')) {
      this.togglePanel(button.dataset.panel, options)
    } else if (options.callback) {
      options.callback()
    }
  },

  reloadPanel (container, data) {
    const button = document.querySelector('.panel-list-button.selected')
    if (!button || (data && button.dataset.panel !== data.panel)) return
    this.addPanelData(container, button.dataset.panel)
  },

  togglePanel (type, options = {}) {
    const container = document.getElementById('sidebar-left-panel')
    this.showHidePanel(container, type, options)
    HelperTrigger.triggerReload('element-overlay', { panelReload: false })
  },

  showHidePanel (container, type, options) {
    const button = document.querySelector(`.panel-list-button[data-panel="${type}"]`)
    if (options.force || !button.classList.contains('selected')) {
      this.showPanel(button, container, type, options)
    } else {
      this.hidePanel(button, container)
    }
  },

  hidePanel (button, container) {
    this.clearSelectedButton(button)
    HelperCanvas.getMain().classList.remove('left-panel-open')
    HelperDOM.hide(container)
  },

  showPanel (button, container, type, options) {
    this.clearSelectedButton()
    button.classList.add('selected')
    HelperCanvas.getMain().classList.add('left-panel-open')
    HelperDOM.show(container)
    this.addPanelData(container, type, options)
  },

  clearSelectedButton (button = null) {
    button = button || document.querySelector('.panel-list-button.selected')
    if (button) button.classList.remove('selected')
  },

  addPanelData (container, type, options = {}) {
    const template = HelperDOM.getTemplate(`template-panel-${type}`)
    HelperDOM.replaceOnlyChild(container, template)
    this.buildPanel(template, type, options)
  },

  buildPanel (container, type, options) {
    if (!Object.keys(this.getList()).includes(type)) return
    const list = container.getElementsByClassName('panel-list')[0]
    this.buildList(container, type, list, options)
  },

  buildList (container, type, list, options) {
    this.getList()[type].buildList(container, type, list, options).catch(error => {
      HelperError.error(error)
    })
  }
}
