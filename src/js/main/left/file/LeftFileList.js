import HelperEvent from '../../../helper/HelperEvent.js'
import LeftCommon from '../LeftCommon.js'
import HelperDOM from '../../../helper/HelperDOM.js'
import LeftFileCommon from './LeftFileCommon.js'
import HelperError from '../../../helper/HelperError.js'
import HelperFile from '../../../helper/HelperFile.js'
import HelperProject from '../../../helper/HelperProject.js'
import HelperForm from '../../../helper/HelperForm.js'
import Page from '../../../page/Page.js'
import HelperComponent from '../../../helper/HelperComponent.js'

export default {
  getEvents () {
    return {
      click: ['clickCreateFolderOverlayEvent', 'clickCreateFileOverlayEvent',
        'clickCloseOverlayEvent'], // order matters
      input: ['inputSearchEvent'],
      keydown: ['keydownCycleNextSearchEvent', 'keydownCyclePreviousSearchEvent',
        'keydownClearOverlayEvent'],
      change: ['changeCreateFolderEvent', 'changeCreateFileEvent']
    }
  },

  clickCreateFolderOverlayEvent (event) {
    if (event.target.closest('.panel-file-create-folder')) {
      this.createOverlay(event.target.closest('.panel-file-create-folder'))
      event.preventDefault()
    }
  },

  clickCreateFileOverlayEvent (event) {
    if (event.target.closest('.panel-file-create-file')) {
      this.createOverlay(event.target.closest('.panel-file-create-file'))
      event.preventDefault()
    }
  },

  clickCloseOverlayEvent (event) {
    if (!event.target.closest('.panel-file-create-overlay')) {
      this.closeOverlay()
    }
  },

  inputSearchEvent (event) {
    if (event.target.classList.contains('panel-file-search')) {
      this.searchList(event.target)
    }
  },

  keydownCycleNextSearchEvent (event) {
    if (event.key && HelperEvent.isNotCtrlAltShift(event) && event.key === 'F3') {
      this.cycleSearch('next')
    }
  },

  keydownCyclePreviousSearchEvent (event) {
    if (event.key && HelperEvent.isNotCtrlAltShift(event) && event.key === 'F2') {
      this.cycleSearch('previous')
    }
  },

  keydownClearOverlayEvent (event) {
    if (event.key && HelperEvent.isNotCtrlAltShift(event) && event.key === 'Escape') {
      this.closeOverlay()
    }
  },

  async changeCreateFolderEvent (event) {
    if (event.target.classList.contains('panel-folder-name')) {
      await this.createFolder(event.target.closest('form'))
    }
  },

  async changeCreateFileEvent (event) {
    if (event.target.classList.contains('panel-file-name') ||
      event.target.id === 'panel-upload-file') {
      await this.createCopyFile(event.target.closest('form'))
    }
  },

  createOverlay (button, folder = null) {
    this.closeOverlay()
    const container = button.nextElementSibling
    this.showOverlay(container, button.dataset.type, folder)
    HelperForm.focusFirstInput(container)
  },

  closeOverlay () {
    const overlay = document.getElementsByClassName('panel-create-container')
    if (overlay.length) HelperDOM.hide(overlay)
  },

  showOverlay (container, type, folder) {
    HelperDOM.show(container)
    const template = this.getOverlayContent(type)
    if (folder) this.prefillFolder(folder, template)
    const content = container.getElementsByClassName('panel-create-overlay')[0]
    HelperDOM.replaceOnlyChild(content, template)
  },

  getOverlayContent (type) {
    const template = HelperDOM.getTemplate(`template-panel-file-create-${type}`)
    this.loadOverlayFolders(template)
    return template
  },

  loadOverlayFolders (container) {
    const list = document.getElementsByClassName('panel-file-list')[0]
    const data = JSON.parse(list.dataset.files)
    const select = container.getElementsByClassName('panel-choose-folder')[0]
    this.buildFolderList(select, data)
  },

  buildFolderList (select, data, level = 0) {
    for (const item of data) {
      if (item.type !== 'folder') continue
      const option = this.buildFolderListOption(item.path, item.name, level)
      select.appendChild(option)
      if (item.children.length) this.buildFolderList(select, item.children, level + 1)
    }
  },

  buildFolderListOption (value, label, level) {
    const node = document.createElement('option')
    node.innerHTML = this.indentLabel(level) + label
    node.setAttributeNS(null, 'value', value)
    return node
  },

  indentLabel (level) {
    let indent = ''
    for (let i = 1; i <= level; i++) {
      indent += ' &nbsp; &nbsp; '
    }
    return indent
  },

  prefillFolder (folder, container) {
    const select = container.getElementsByClassName('panel-choose-folder')[0]
    select.value = folder
  },

  searchList (input) {
    const cycle = input.previousElementSibling
    if (input.value.length >= 2) {
      this.searchSelectItem(input, cycle)
    } else { // < 2
      this.clearSearchSelectItem(cycle)
    }
  },

  searchSelectItem (input, cycle) {
    const li = LeftCommon.getSearchItem(input)
    if (li) {
      this.showSearchSelectItem(li, cycle)
    } else {
      this.clearSearchSelectItem(cycle)
    }
  },

  showSearchSelectItem (li, cycle) {
    HelperDOM.show(cycle)
    LeftCommon.selectItem(li)
  },

  clearSearchSelectItem (cycle) {
    HelperDOM.hide(cycle)
    LeftCommon.deselectItem('file')
  },

  cycleSearch (cycleType) {
    const cycle = document.getElementsByClassName('panel-search-cycle-file')[0]
    if (!cycle || HelperDOM.isHidden(cycle)) return
    const input = cycle.nextElementSibling
    const li = LeftCommon.getSearchItem(input, cycleType)
    if (li) this.showSearchSelectItem(li, cycle)
  },

  async createFolder (form) {
    if (!LeftFileCommon.validateFileName(form)) return
    const fields = form.elements
    await LeftFileCommon.createFolder(fields.name.value, fields.parent.value).catch(error => {
      HelperError.error(error)
    })
  },

  async createCopyFile (form) {
    if (!LeftFileCommon.validateFileName(form)) return
    const fields = form.elements
    if (fields.file.files.length) {
      await this.copyFile(fields.file.files[0].path, fields.parent.value)
    } else {
      await this.createFile(fields.name.value, fields.parent.value)
    }
  },

  async copyFile (file, folder) {
    await LeftFileCommon.copyFile(file, folder).catch(error => {
      HelperError.error(error)
    })
  },

  async createFile (name, folder) {
    folder = folder || HelperProject.getFolder()
    const file = folder + '/' + this.fixFileName(name)
    if (HelperFile.getFileExtension(file) === 'html') {
      const success = await this.createHtmlFile(file, folder)
      if (success) await Page.loadMain(file)
    } else {
      await this.createRegularFile(file)
    }
  },

  fixFileName (name) {
    const ext = HelperFile.getFileExtension(name)
    if (!ext) name += '.html'
    return HelperFile.sanitizeFile(name)
  },

  async createHtmlFile (file, folder) {
    if (HelperFile.isComponentFile(file)) {
      return await this.createRegularFile(file, HelperComponent.getEmptyComponent())
    } else {
      const success = await this.createRegularFile(file, HelperFile.getFullHtml(file))
      if (success) await this.createPageCssFile(file)
      return success
    }
  },

  async createPageCssFile (file) {
    const cssFile = HelperProject.getFolder() + '/css/page/' + HelperFile.getPageCssFile(file)
    await this.createRegularFile(cssFile)
  },

  async createRegularFile (file, contents = '') {
    return await LeftFileCommon.createFile(file, contents).catch(error => {
      HelperError.error(error)
    })
  }
}
