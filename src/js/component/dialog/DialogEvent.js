import HelperEvent from '../../helper/HelperEvent.js'
import DialogComponent from '../DialogComponent.js'

export default {
  getEvents () {
    return {
      click: ['clickCloseEvent'],
      keydown: ['keydownCloseEvent']
    }
  },

  clickCloseEvent (event) {
    if (event.target.closest('.dialog-close')) {
      DialogComponent.closeDialog(event.target.closest('.dialog'))
    }
  },

  keydownCloseEvent (event) {
    if (event.key && HelperEvent.isNotCtrlAltShift(event) && event.key === 'Escape') {
      DialogComponent.closeAllDialogs(event)
    }
  }
}
