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
import TopCommandSave from '../../top/command/TopCommandSave.js'
import LeftFileLoad from './LeftFileLoad.js'

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
    if (event.target.closest('.panel-option-load-html:not(.disabled)')) {
      await this.loadHtmlFile(this.getActiveMenuElement())
    }
  },

  async clickAddComponentHtmlEvent (event) {
    if (event.target.closest('.panel-option-add-component:not(.disabled)')) {
      await this.addComponentHtml(this.getActiveMenuElement())
    }
  },

  async clickOpenFileEvent (event) {
    if (event.target.closest('.panel-option-open-file:not(.disabled)')) {
      await this.openFile(this.getActiveMenuElement())
    }
  },

  clickShowRenameItemEvent (event) {
    if (event.target.closest('.panel-option-rename:not(.disabled)')) {
      this.showRenameItem(this.getActiveMenuElement())
    }
  },

  async clickDeleteItemEvent (event) {
    if (event.target.closest('.panel-option-delete:not(.disabled)')) {
      await this.deleteItem(this.getActiveMenuElement())
    }
  },

  async clickCopySvgEvent (event) {
    if (event.target.closest('.panel-option-copy-svg:not(.disabled)')) {
      await this.copySvgCode(this.getActiveMenuElement())
    }
  },

  async keydownFinishRenameItemEvent (event) {
    if (event.key && HelperEvent.isNotCtrlAltShift(event) && event.key === 'Enter') {
      await this.finishRenameItem()
    }
  },

  keydownCloseEvent (event) {
    if (event.key && HelperEvent.isNotCtrlAltShift(event) && event.key === 'Escape') {
      this.cancelRenameFile()
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
    this.disableCurrentComponent(item.dataset.ref, template)
    this.disableWritable(item, template)
    return template
  },

  getItemType (item) {
    if (HelperFile.isComponentFile(item.dataset.ref)) {
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

  disableCurrentComponent (file, menu) {
    if (HelperFile.isComponentFile(file) && HelperProject.getFile() === file) {
      for (const li of menu.getElementsByClassName('menu-list')[0].children) {
        li.classList.add('disabled')
      }
    }
  },

  disableWritable (item, menu) {
    // we now allow the rename/delete of current files because we reload the index file on finish
    const check = HelperFile.isReadonly(item.dataset.ref)
    for (const li of menu.getElementsByClassName('writable')) {
      li.classList.toggle('disabled', check)
    }
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
    const form = HelperDOM.getTemplate('template-panel-file-rename-file')
    form.elements.name.setAttributeNS(null, 'value', label.textContent)
    label.innerHTML = form.outerHTML
    label.children[0].elements.name.select()
  },

  cancelRenameFile () {
    const form = document.getElementsByClassName('panel-file-rename-form')[0]
    if (!form) return
    const li = form.closest('li')
    form.parentNode.innerHTML = li.dataset.search
    li.classList.remove('editing')
    li.setAttributeNS(null, 'draggable', 'true')
  },

  async finishRenameItem () {
    const form = document.getElementsByClassName('panel-file-rename-form')[0]
    if (!form) return
    if (!LeftFileCommon.validateFileName(form)) return
    const item = form.elements.name.closest('.panel-file-item')
    const name = HelperFile.sanitizeFile(form.elements.name.value)
    await TopCommandSave.save(true)
    await window.electron.invoke('rendererRenamePath', item.dataset.ref, name)
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'file' })
    // we can't reload the current file because it might have been renamed by the operation
    await LeftFileLoad.reloadIndexFile()
  },

  async deleteItem (item) {
    await window.electron.invoke('rendererDeletePath', item.dataset.ref)
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'file' })
    // we can't reload the current file because it might have been renamed by the operation
    await LeftFileLoad.reloadIndexFile()
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
    const code = await window.electron.invoke('rendererGetFileContents', item.dataset.ref)
    await navigator.clipboard.writeText(code)
  }
}
