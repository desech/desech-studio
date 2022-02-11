import HelperEvent from '../helper/HelperEvent.js'
import HelperDOM from '../helper/HelperDOM.js'
import HelperTrigger from '../helper/HelperTrigger.js'
import LeftFileData from './left/file/LeftFileData.js'
import LeftElementData from './left/element/LeftElementData.js'
import HelperCanvas from '../helper/HelperCanvas.js'
import TopCommon from './top/TopCommon.js'
import LeftVariableData from './left/variable/LeftVariableData.js'

export default {
  getList () {
    return {
      file: LeftFileData,
      element: LeftElementData,
      variable: LeftVariableData
    }
  },

  getKeyMap () {
    return {
      1: 'file',
      2: 'element',
      3: 'variable'
    }
  },

  getEvents () {
    return {
      openpanel: ['openpanelEvent'],
      closepanel: ['closepanelEvent'],
      reloadcontainer: ['reloadcontainerEvent'],
      click: ['clickTogglePanelEvent'],
      keydown: ['keydownTogglePanelEvent']
    }
  },

  async openpanelEvent (event) {
    if (event.target.classList.contains('panel-list-button')) {
      await this.openPanel(event.target, event.detail || {})
    }
  },

  closepanelEvent (event) {
    if (event.target.classList.contains('panel-list-button')) {
      this.closePanel(event.target)
    }
  },

  async reloadcontainerEvent (event) {
    if (event.target.id === 'sidebar-left-panel') {
      await this.reloadPanel(event.target, event.detail.panels)
    }
  },

  async clickTogglePanelEvent (event) {
    if (event.target.closest('.panel-list-button')) {
      await this.togglePanel(event.target.closest('.panel-list-button').dataset.panel)
    }
  },

  async keydownTogglePanelEvent (event) {
    if (event.key && HelperEvent.areMainShortcutsAllowed(event) &&
      HelperEvent.isNotCtrlAltShift(event) && !HelperCanvas.isPreview() &&
      Object.keys(this.getKeyMap()).includes(event.key)) {
      await this.togglePanel(this.getKeyMap()[event.key])
    }
  },

  async openPanel (button, options) {
    if (options.force || !button.classList.contains('selected')) {
      await this.togglePanel(button.dataset.panel, options)
    } else if (options.callback) {
      options.callback()
    }
  },

  closePanel (button) {
    const container = document.getElementById('sidebar-left-panel')
    this.hidePanel(button, container)
  },

  async reloadPanel (container, panels) {
    const button = document.querySelector('.panel-list-button.selected')
    if (button && (!panels || panels.includes(button.dataset.panel))) {
      await this.addPanelData(container, button.dataset.panel)
    }
  },

  async togglePanel (type, options = {}) {
    const container = document.getElementById('sidebar-left-panel')
    await this.showHidePanel(container, type, options)
    HelperTrigger.triggerReload('element-overlay')
    TopCommon.positionDragHandle()
  },

  async showHidePanel (container, type, options) {
    const button = document.querySelector(`.panel-list-button[data-panel="${type}"]`)
    if (options.force || !button.classList.contains('selected')) {
      await this.showPanel(button, container, type, options)
    } else {
      this.hidePanel(button, container)
    }
  },

  hidePanel (button, container) {
    this.clearSelectedButton(button)
    HelperCanvas.getMain().classList.remove('left-panel-open')
    HelperDOM.hide(container)
  },

  async showPanel (button, container, type, options) {
    this.clearSelectedButton()
    button.classList.add('selected')
    HelperCanvas.getMain().classList.add('left-panel-open')
    HelperDOM.show(container)
    await this.addPanelData(container, type, options)
  },

  clearSelectedButton (button = null) {
    button = button || document.querySelector('.panel-list-button.selected')
    if (button) button.classList.remove('selected')
  },

  async addPanelData (container, type, options = {}) {
    const template = HelperDOM.getTemplate(`template-panel-${type}`)
    HelperDOM.replaceOnlyChild(container, template)
    await this.buildPanel(template, type, options)
  },

  async buildPanel (container, type, options) {
    if (!Object.keys(this.getList()).includes(type)) return
    const list = container.getElementsByClassName('panel-list')[0]
    await this.getList()[type].buildList(container, type, list, options)
  }
}
