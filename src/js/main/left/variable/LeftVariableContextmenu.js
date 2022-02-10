import StateSelectedVariable from '../../../state/StateSelectedVariable.js'
import Contextmenu from '../../../component/Contextmenu.js'
import HelperDOM from '../../../helper/HelperDOM.js'
import HelperEvent from '../../../helper/HelperEvent.js'
import RightVariableForm from '../../right/section/variable/RightVariableForm.js'

export default {
  getEvents () {
    return {
      contextmenu: ['contextmenuShowMenuEvent'],
      keydown: ['keydownCloseEvent'],
      click: ['clickUpdateItemEvent', 'clickDeleteItemEvent']
    }
  },

  contextmenuShowMenuEvent (event) {
    if (event.target.closest('.panel-variable-item')) {
      this.showContextmenu(event.target.closest('li'), event.clientX, event.clientY)
    }
  },

  keydownCloseEvent (event) {
    if (event.key && HelperEvent.isNotCtrlAltShift(event) && event.key === 'Escape') {
      this.hideMenu()
    }
  },

  clickUpdateItemEvent (event) {
    if (event.target.closest('.panel-option-variable-update')) {
      // does nothing, since you already have the update form on the right, by simply selecting
      // the variable
    }
  },

  async clickDeleteItemEvent (event) {
    if (event.target.closest('.panel-option-variable-delete')) {
      await RightVariableForm.deleteVariable()
    }
  },

  showContextmenu (item, x, y) {
    StateSelectedVariable.selectVariable(item.dataset.ref)
    const menu = document.getElementById('variable-contextmenu')
    menu.dataset.ref = item.dataset.ref
    const options = HelperDOM.getTemplate('template-contextmenu-variable')
    Contextmenu.reloadMenu(menu, options, x, y)
  },

  hideMenu () {
    Contextmenu.removeMenu()
    StateSelectedVariable.deselectVariable()
  }
}
