import HelperEvent from '../../../helper/HelperEvent.js'
import Page from '../../../page/Page.js'
import CanvasElementComponent from '../../canvas/element/CanvasElementComponent.js'
import HelperTrigger from '../../../helper/HelperTrigger.js'
import HelperFile from '../../../helper/HelperFile.js'
import HelperDOM from '../../../helper/HelperDOM.js'
import HelperProject from '../../../helper/HelperProject.js'
import Contextmenu from '../../../component/Contextmenu.js'
import LeftFileCommon from './LeftFileCommon.js'
import LeftFileList from './LeftFileList.js'

export default {
  getEvents () {
    return {
      click: ['clickHideMenuEvent', 'clickLoadHtmlEvent', 'clickAddComponentHtmlEvent',
        'clickOpenFileEvent', 'clickShowRenameItemEvent', 'clickDeleteItemEvent',
        'clickNewFolderEvent', 'clickNewFileEvent', 'clickCopySvgEvent'],
      keydown: ['keydownFinishRenameItemEvent', 'keydownCloseEvent'],
      contextmenu: ['contextmenuShowMenuEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickHideMenuEvent (event) {
    if (HelperDOM.isVisible(document.getElementById('file-contextmenu'))) {
      this.hideMenu()
    }
  },

  contextmenuShowMenuEvent (event) {
    if (event.target.closest('.panel-file-item')) {
      this.showContextmenu(event.target.closest('.panel-file-item'), event.clientX, event.clientY)
    }
  },

  async clickLoadHtmlEvent (event) {
    if (event.target.classList.contains('panel-option-load-html')) {
      await this.loadHtmlFile(this.getActiveMenuElement())
    }
  },

  async clickAddComponentHtmlEvent (event) {
    if (event.target.classList.contains('panel-option-add-component')) {
      await this.addComponentHtml(this.getActiveMenuElement())
    }
  },

  async clickOpenFileEvent (event) {
    if (event.target.classList.contains('panel-option-open-file')) {
      await this.openFile(this.getActiveMenuElement())
    }
  },

  async clickDeleteItemEvent (event) {
    if (event.target.classList.contains('panel-option-delete')) {
      await this.deleteItem(this.getActiveMenuElement())
    }
  },

  clickShowRenameItemEvent (event) {
    if (event.target.classList.contains('panel-option-rename')) {
      this.showRenameItem(this.getActiveMenuElement())
    }
  },

  async clickCopySvgEvent (event) {
    if (event.target.classList.contains('panel-option-copy-svg')) {
      await this.copySvgCode(this.getActiveMenuElement())
    }
  },

  async keydownFinishRenameItemEvent (event) {
    if (event.key && HelperEvent.isNotCtrlAltShift(event) && (event.key === 'Escape' ||
      event.key === 'Enter')) {
      await this.finishRenameItem()
    }
  },

  keydownCloseEvent (event) {
    if (event.key && HelperEvent.isNotCtrlAltShift(event) && event.key === 'Escape') {
      this.closeActiveItem()
      this.hideMenu()
    }
  },

  clickNewFolderEvent (event) {
    if (event.target.classList.contains('panel-option-create-folder')) {
      this.showNewFolderOverlay(this.getActiveMenuElement())
    }
  },

  clickNewFileEvent (event) {
    if (event.target.classList.contains('panel-option-create-file')) {
      this.showNewFileOverlay(this.getActiveMenuElement())
    }
  },

  getActiveMenuElement () {
    const menu = document.getElementById('file-contextmenu')
    return document.querySelector(`.panel-file-item[data-ref="${menu.dataset.ref}"]`)
  },

  hideMenu () {
    Contextmenu.emptyMenu()
    LeftFileCommon.clearActiveItem()
  },

  showContextmenu (item, x, y) {
    LeftFileCommon.setActiveItem(item)
    const menu = document.getElementById('file-contextmenu')
    menu.dataset.ref = item.dataset.ref
    const options = this.getMenuOptions(item)
    Contextmenu.reloadMenu(menu, options, x, y)
  },

  getMenuOptions (item) {
    const type = this.getItemType(item)
    const template = HelperDOM.getTemplate(`template-contextmenu-file-${type}`)
    if (HelperFile.isReadonly(item.dataset.ref) || item.classList.contains('loaded')) {
      this.hideWritable(template)
    }
    return template
  },

  getItemType (item) {
    if (HelperFile.isComponentFile(item.dataset.ref) &&
      HelperProject.getFile() !== item.dataset.ref) {
      return 'component'
    } else if (item.dataset.extension === 'svg') {
      return 'svg'
    } else if (item.dataset.extension === 'html') {
      return 'html'
    } else {
      // folder or file
      return item.dataset.type
    }
  },

  hideWritable (menu) {
    const writable = menu.getElementsByClassName('writable')
    HelperDOM.hide(writable)
  },

  async loadHtmlFile (item) {
    await Page.loadMain(item.dataset.ref)
  },

  async addComponentHtml (item) {
    await CanvasElementComponent.createElement(item.dataset.ref)
  },

  async openFile (item) {
    await window.electron.shellOpenPath(item.dataset.ref)
    LeftFileCommon.clearActiveItem()
  },

  async executeFile (item) {
    if (item.dataset.extension === 'html') {
      await this.loadHtmlFile(item)
    } else {
      await this.openFile(item)
    }
  },

  showRenameItem (item) {
    item.classList.add('editing')
    item.removeAttributeNS(null, 'draggable')
    this.makeLabelEditable(item)
  },

  makeLabelEditable (item) {
    const label = item.getElementsByClassName('panel-item-name')[0]
    label.innerHTML = `<input class="panel-file-input" value="${label.textContent}">`
    label.children[0].select()
  },

  async finishRenameItem () {
    const input = document.querySelector('.panel-file-list .panel-file-input')
    if (!input) return
    const item = input.closest('.panel-file-item')
    const newPath = HelperFile.sanitizeFile(input.value) || 'new'
    await window.electron.invoke('rendererRenamePath', item.dataset.ref, newPath)
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'file' })
  },

  async deleteItem (item) {
    const file = item.dataset.ref
    await HelperFile.deleteFile(file)
    if (HelperFile.getFileExtension(file) === 'html') {
      await this.deleteHtmlCssFile(file)
    }
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'file' })
  },

  async deleteHtmlCssFile (htmlFile) {
    if (HelperFile.isComponentFile(htmlFile)) return
    const folder = HelperProject.getFolder()
    const cssFile = HelperFile.getPageCssFile(htmlFile, folder)
    await HelperFile.deleteFile(folder + '/css/page/' + cssFile)
  },

  closeActiveItem () {
    const list = document.querySelector('.panel-item-options:not([hidden])')
    if (list) LeftFileCommon.clearActiveItem()
  },

  showNewFolderOverlay (item) {
    const folder = this.getParentFolder(item.dataset)
    const button = document.getElementsByClassName('panel-file-create-folder')[0]
    LeftFileList.createOverlay(button, folder)
  },

  showNewFileOverlay (item) {
    const folder = this.getParentFolder(item.dataset)
    const button = document.getElementsByClassName('panel-file-create-file')[0]
    LeftFileList.createOverlay(button, folder)
  },

  getParentFolder (data) {
    const folder = (data.type === 'folder') ? data.ref : HelperFile.getDirname(data.ref)
    return (folder === HelperProject.getFolder()) ? null : folder
  },

  async copySvgCode (item) {
    const code = await window.electron.invoke('rendererCopySvgCode', item.dataset.ref)
    await navigator.clipboard.writeText(code)
  }
}
