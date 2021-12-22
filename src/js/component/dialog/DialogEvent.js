import HelperEvent from '../../helper/HelperEvent.js'
import DialogComponent from '../DialogComponent.js'
import HelperDOM from '../../helper/HelperDOM.js'

export default {
  getEvents () {
    return {
      click: ['clickCloseEvent'],
      keydown: ['keydownCloseEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickCloseEvent (event) {
    if (event.target.closest('.dialog-close')) {
      this.closeDialog(event.target.closest('.dialog'))
    }
  },

  keydownCloseEvent (event) {
    if (event.key && HelperEvent.isNotCtrlAltShift(event) && event.key === 'Escape') {
      DialogComponent.closeAllDialogs(event)
    }
  },

  closeDialog (dialog) {
    if (!dialog.dataset.locked) dialog.remove()
  }
}
