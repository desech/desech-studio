import HelperDOM from '../helper/HelperDOM.js'
import HelperEvent from '../helper/HelperEvent.js'

export default {
  getEvents () {
    return {
      click: ['clickButtonEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickButtonEvent (event) {
    if (event.target.closest('button.tab-button')) {
      this.selectTab(event.target.closest('button'))
    }
  },

  selectTab (button) {
    const container = button.closest('.tab-main')
    this.selectButton(button, container)
    this.enableTab(button, container)
  },

  getMain (button) {
    return button.closest('.tab-main')
  },

  selectButton (button, container) {
    this.deselectButton(container)
    button.classList.add('selected')
  },

  deselectButton (container) {
    const selected = container.querySelector('.selected.tab-button')
    if (selected) {
      selected.classList.remove('selected')
    }
  },

  enableTab (button, container) {
    this.hideTab(container)
    this.showTab(button.dataset.tab, container)
  },

  hideTab (container) {
    const selected = container.querySelector('.tab-container:not([hidden])')
    if (selected) {
      HelperDOM.hide(selected)
    }
  },

  showTab (name, container) {
    const tab = container.getElementsByClassName(name)[0]
    HelperDOM.show(tab)
  }
}
