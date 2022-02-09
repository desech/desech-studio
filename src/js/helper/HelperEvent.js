import HelperCanvas from './HelperCanvas.js'

export default {
  areMainShortcutsAllowed (event) {
    return HelperCanvas.getMain() && this.areShortcutsAllowed(event)
  },

  areShortcutsAllowed (event) {
    const isField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)
    const isEditing = HelperCanvas.isOperation('editing')
    return !isField && !isEditing
  },

  isNotCtrlAltShift (event) {
    return !this.isCtrlCmd(event) && !event.altKey && !event.shiftKey
  },

  isCtrlCmd (event) {
    return (event.ctrlKey || event.metaKey)
  },

  isLeftClick (event) {
    return (event.button === 0)
  }
}
