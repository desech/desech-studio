import StateSelectedVariable from '../../../state/StateSelectedVariable.js'

export default {
  getEvents () {
    return {
      click: ['clickSelectItemEvent', 'clickDeselectItemEvent']
    }
  },

  clickSelectItemEvent (event) {
    if (event.target.closest('.panel-variable-item')) {
      this.selectItem(event)
    }
  },

  clickDeselectItemEvent (event) {
    if (event.target.classList.contains('panel-list-variables-box')) {
      StateSelectedVariable.deselectVariable()
    }
  },

  selectItem (event) {
    const li = event.target.closest('.panel-variable-item')
    StateSelectedVariable.selectVariable(li.dataset.ref)
  }
}
