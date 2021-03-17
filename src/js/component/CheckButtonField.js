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
    if (event.target.closest('.check-button')) {
      this.toggleButton(event.target.closest('.check-button'))
    }
  },

  toggleButton (button) {
    const container = button.closest('.check-button-radio')
    if (button.classList.contains('selected')) {
      if (!container || container.dataset.removeSelected) {
        button.classList.remove('selected')
      }
    } else {
      if (container) this.deselectButtons(container)
      button.classList.add('selected')
    }
  },

  deselectButtons (container) {
    const selected = container.getElementsByClassName('selected')[0]
    if (selected) selected.classList.remove('selected')
  },

  getValue (button) {
    const container = button.closest('.check-button-radio')
    return container ? this.getRadioValue(container) : this.getCheckboxValue(button)
  },

  getRadioValue (container) {
    const selected = container.getElementsByClassName('selected')[0]
    return selected ? selected.value : ''
  },

  getCheckboxValue (button) {
    return button.classList.contains('selected') ? button.value : ''
  },

  setValue (button, value) {
    if (value === button.value) button.classList.add('selected')
  }
}
