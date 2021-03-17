import HelperDOM from '../../helper/HelperDOM.js'
import ColorPickerSwatch from './ColorPickerSwatch.js'
import HelperColor from '../../helper/HelperColor.js'
import ColorPickerSolidColor from './ColorPickerSolidColor.js'
import HelperEvent from '../../helper/HelperEvent.js'

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
    if (event.target.closest('.color-button-wrapper:not([data-noclick]) .color-button-check')) {
      this.toggleButton(event.target.closest('.color-button-check'))
    }
  },

  toggleButton (button) {
    const container = this.getPickerContainer(button)
    if (button.classList.contains('color-button-off')) {
      this.hideColorPicker(container, button.nextElementSibling)
    } else {
      this.toggleOnButton(container, button)
    }
  },

  getPickerContainer (button) {
    return button.closest('.color-button-wrapper').getElementsByClassName('color-button-picker')[0]
  },

  toggleOnButton (container, button) {
    const color = button.getElementsByClassName('color-button')[0].style.backgroundColor
    this.toggleColorPicker(container, button, color)
  },

  toggleColorPicker (container, button, color = '') {
    if (!button.classList.contains('active')) {
      this.showColorPicker(container, button, color)
    } else {
      this.hideColorPicker(container, button)
    }
  },

  showColorPicker (container, button, color) {
    button.classList.add('active')
    const colorPicker = this.buildColorPicker(container)
    this.injectColor(colorPicker, color)
  },

  buildColorPicker (container) {
    const template = HelperDOM.getTemplate('template-color-picker')
    container.appendChild(template)
    return template
  },

  injectColor (colorPicker, color) {
    ColorPickerSwatch.injectSwatches(colorPicker)
    if (color) {
      const rgb = HelperColor.extractRgb(color)
      ColorPickerSolidColor.injectColor(colorPicker, rgb)
    }
  },

  hideColorPicker (container, button) {
    button.classList.remove('active')
    HelperDOM.deleteChildren(container)
  }
}
