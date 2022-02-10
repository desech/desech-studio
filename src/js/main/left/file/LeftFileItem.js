import LeftCommon from '../LeftCommon.js'
import HelperEvent from '../../../helper/HelperEvent.js'
import HelperTrigger from '../../../helper/HelperTrigger.js'
import HelperFile from '../../../helper/HelperFile.js'
import HelperError from '../../../helper/HelperError.js'
import HelperProject from '../../../helper/HelperProject.js'
import LeftFileCommon from './LeftFileCommon.js'
import LeftFileContextmenu from './LeftFileContextmenu.js'
import TopCommandSave from '../../top/command/TopCommandSave.js'
import LeftFileLoad from './LeftFileLoad.js'

export default {
  _timer: null,

  getEvents () {
    return {
      click: ['clickCollapseExpandEvent', 'clickSelectSourceFileEvent',
        'clickChooseSourceFileEvent', 'clickHighlightSourceFileEvent'],
      dblclick: ['dblclickCollapseExpandEvent', 'dblclickExecuteFileEvent'],
      keydown: ['keydownClearSourceFileEvent'],
      dragstart: ['dragstartMoveItemEvent'],
      dragdropbefore: ['dragdropbeforeMoveItemEvent'],
      dragdroproot: ['dragdroprootMoveItemEvent']
    }
  },

  clickCollapseExpandEvent (event) {
    if (event.target.closest('.panel-item-expand-button[data-type="file"]')) {
      this.collapseExpand(event.target.closest('li'))
      // ignore all click events
      event.preventDefault()
    }
  },

  dblclickCollapseExpandEvent (event) {
    if (event.target.closest('.panel-file-item[data-type="folder"]:not(.editing)')) {
      this.collapseExpand(event.target.closest('li'))
      // ignore all click events
      event.preventDefault()
    }
  },

  async dblclickExecuteFileEvent (event) {
    if (event.target.closest('.panel-file-item[data-type="file"]:not(.editing)')) {
      await this.executeFile(event.target.closest('li'))
      // ignore all click events
      event.preventDefault()
    }
  },

  clickSelectSourceFileEvent (event) {
    if (event.target.closest('.panel-file-list[data-select-file]')) {
      this.selectSourceFile(event.target.closest('li'))
      // ignore all click events
      event.preventDefault()
    }
  },

  clickChooseSourceFileEvent (event) {
    if (event.target.closest('.choose-source-button')) {
      this.chooseSourceFile(event.target.closest('.choose-source-button'))
    }
  },

  clickHighlightSourceFileEvent (event) {
    if (event.target.closest('.highlight-source-file[value]')) {
      this.highlightSourceFile(event.target)
    }
  },

  keydownClearSourceFileEvent (event) {
    if (event.key && HelperEvent.isNotCtrlAltShift(event) && event.key === 'Escape') {
      this.clearSourceFile()
    }
  },

  dragstartMoveItemEvent (event) {
    if (event.target.nodeType !== Node.TEXT_NODE &&
      event.target.closest('.panel-file-item:not(.editing)')) {
      this.startMoveItem(event.target.closest('.panel-file-item'))
    }
  },

  dragdroprootMoveItemEvent (event) {
    if (event.target.classList.contains('panel-file-list')) {
      this.moveToRoot(event.detail).catch(error => {
        HelperError.error(error)
      })
    }
  },

  dragdropbeforeMoveItemEvent (event) {
    if (event.target.classList.contains('panel-file-list')) {
      const from = event.detail.from.element.dataset.ref
      const to = event.detail.to.element.dataset.ref
      this.moveToFolder(from, to).catch(error => {
        HelperError.error(error)
      })
    }
  },

  clearTimeout () {
    // it's important to clear our state at the end, otherwise we have leftovers spilling
    clearTimeout(this._timer)
    this._timer = null
  },

  async executeFile (li) {
    this.clearTimeout()
    LeftFileCommon.clearActiveItem()
    await LeftFileContextmenu.executeFile(li)
  },

  collapseExpand (li) {
    this.clearTimeout()
    const button = li.getElementsByClassName('panel-item-expand-button')[0]
    LeftCommon.collapseExpandItem(button)
    LeftFileCommon.clearActiveItem(li)
  },

  chooseSourceFile (button) {
    HelperTrigger.triggerOpenPanel('panel-button-file', {
      callback: () => {
        this.chooseSourceFileCallback(button.dataset.folder, button.id)
      }
    })
  },

  chooseSourceFileCallback (folder, buttonId) {
    const ref = HelperFile.getAbsPath(folder)
    const item = document.querySelector(`.panel-item[data-ref="${ref}"]`)
    if (!item) throw new Error(`Unknown file ${ref}`)
    LeftCommon.selectItem(item, 'selected')
    LeftCommon.forceExpandItem(item)
    item.parentNode.dataset.selectFile = buttonId
  },

  clearSourceFile () {
    const list = document.querySelector('.panel-file-list[data-select-file]')
    if (list) delete list.dataset.selectFile
    const selected = document.querySelector('.panel-file-item.selected')
    if (selected) selected.classList.remove('selected')
  },

  selectSourceFile (item) {
    if (!item) return
    const buttonId = item.parentNode.dataset.selectFile
    const srcButton = document.getElementById(buttonId)
    if (!srcButton || item.dataset.container) {
      this.clearSourceFile()
    } else {
      this.confirmSourceFile(item, srcButton)
    }
  },

  confirmSourceFile (item, button) {
    this.clearSourceFile()
    this.triggerSourceButton(button, item.dataset.ref)
  },

  triggerSourceButton (button, file) {
    const event = new CustomEvent('setsource', { bubbles: true, cancelable: true, detail: file })
    button.dispatchEvent(event)
  },

  highlightSourceFile (file) {
    HelperTrigger.triggerOpenPanel('panel-button-file', {
      callback: () => {
        this.highlightSourceFileCallback(file)
      }
    })
  },

  highlightSourceFileCallback (node) {
    const button = node.closest('.grid').getElementsByClassName('choose-source-button')[0]
    const item = document.querySelector(`.panel-item[data-ref="${node.value}"]`)
    if (!item) throw new Error(`Unknown file ${node.value}`)
    LeftCommon.selectItem(item, 'selected')
    item.parentNode.dataset.selectFile = button.id
  },

  startMoveItem (item) {
    LeftCommon.startSortItem(item)
  },

  async moveToRoot (data) {
    const root = HelperProject.getFolder()
    await this.moveToFolder(data.from.element.dataset.ref, root)
  },

  async moveToFolder (from, to) {
    await TopCommandSave.save(true)
    await window.electron.invoke('rendererMoveToFolder', from, to)
    HelperTrigger.triggerReload('sidebar-left-panel', { panels: ['file'] })
    await LeftFileLoad.reloadCurrentFile()
  }
}
