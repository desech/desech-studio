import HelperDOM from '../../../../helper/HelperDOM.js'
import RightBorderFillForm from './RightBorderFillForm.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import RightBorderFillCommon from './RightBorderFillCommon.js'
import RightBorderFillProperty from './RightBorderFillProperty.js'

export default {
  getEvents () {
    return {
      // order matters
      click: ['clickSwitchFillEvent', 'clickRemoveFillEvent', 'clickToggleFillEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickSwitchFillEvent (event) {
    if (event.target.closest('.border-fill-button .color-button-main')) {
      this.switchFill(event.target.closest('form'))
      // then clickToggleFillEvent() happens
    }
  },

  clickRemoveFillEvent (event) {
    if (event.target.closest('.border-fill-button .color-button-off')) {
      this.removeFill(event.target.closest('form'))
    }
  },

  clickToggleFillEvent (event) {
    if (event.target.closest('.border-fill-button .color-button-main')) {
      this.toggleFill(event.target.closest('.color-button-main'))
    }
  },

  switchFill (container) {
    const type = container.getElementsByClassName('border-details-container')[0].dataset.type
    const cssFill = RightBorderFillCommon.getFillValue(type)
    const button = container.getElementsByClassName('color-button')[0]
    const buttonFill = button.style.backgroundColor || button.style.backgroundImage
    if (!cssFill && buttonFill) RightBorderFillProperty.updateFill(container, buttonFill)
  },

  removeFill (container) {
    RightBorderFillProperty.updateFill(container, '')
    RightBorderFillCommon.hideFillContainer(container)
  },

  toggleFill (button) {
    const container = button.closest('form')
    if (!button.classList.contains('active')) {
      this.showFillContainer(container, button)
    } else {
      RightBorderFillCommon.hideFillContainer(container, button)
    }
  },

  showFillContainer (container, button) {
    button.classList.add('active')
    const form = HelperDOM.getTemplate('template-border-fill')
    const type = button.closest('.border-details-container').dataset.type
    this.addPickerToFill(container, form, type)
    RightBorderFillForm.buildForm(form, type) // the color picker needs the dom to be updated before we do any color changes
  },

  addPickerToFill (container, form, type) {
    const fill = container.getElementsByClassName('border-fill-container')[0]
    fill.appendChild(form)
    fill.dataset.type = type
  },

  injectFill (container, type) {
    const fill = RightBorderFillCommon.getFillValue(type)
    this.injectButtons(container, fill)
    this.injectPreview(container, fill)
  },

  injectButtons (container, fill) {
    if (!fill) return
    const buttons = container.getElementsByClassName('color-button-main')
    HelperDOM.toggleClass(buttons[0], 'selected', !fill)
    HelperDOM.toggleClass(buttons[1], 'selected', fill)
  },

  injectPreview (container, fill) {
    const preview = container.getElementsByClassName('color-button')[0]
    RightBorderFillCommon.setFillValue(preview, fill)
  }
}
