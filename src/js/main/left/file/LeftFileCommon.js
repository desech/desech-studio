import HelperFile from '../../../helper/HelperFile.js'
import HelperTrigger from '../../../helper/HelperTrigger.js'
import HelperProject from '../../../helper/HelperProject.js'

export default {
  async createFolder (name, root = null) {
    await window.electron.invoke('rendererCreateFolder', {
      root: root || HelperProject.getFolder(),
      folder: HelperFile.sanitizeFolder(name)
    })
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'file' })
  },

  async copyFile (file, root = null) {
    root = root || HelperProject.getFolder()
    const name = HelperFile.sanitizeFile(HelperFile.getBasename(file))
    await window.electron.invoke('rendererCopyFile', { root, file, name })
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'file' })
  },

  async createFile (file, contents) {
    const success = await window.electron.invoke('rendererCreateFile', { file, contents })
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'file' })
    return success
  },

  setActiveItem (item) {
    if (item.classList.contains('editing')) return
    this.clearActiveItem()
    item.classList.add('active')
  },

  clearActiveItem () {
    const item = document.querySelector('.panel-file-item.active')
    if (!item) return
    item.classList.remove('active')
    this.clearItemEditing(item)
  },

  clearItemEditing (item) {
    if (!item.classList.contains('editing')) return
    item.classList.remove('editing')
    item.setAttributeNS(null, 'draggable', 'true')
    this.revertEditableLabel(item)
  },

  revertEditableLabel (item) {
    const label = item.getElementsByClassName('panel-item-name')[0]
    label.innerHTML = label.children[0].value
  }
}
