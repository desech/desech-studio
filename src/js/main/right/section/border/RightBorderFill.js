import HelperDOM from '../../../../helper/HelperDOM.js'
import RightBorderFillForm from './RightBorderFillForm.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import RightBorderFillCommon from './RightBorderFillCommon.js'
import RightBorderFillProperty from './RightBorderFillProperty.js'
import RightCommon from '../../RightCommon.js'

export default {
  getEvents () {
    return {
      click: ['clickSetBorderFillEvent'],
      change: ['changeSelectColorEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickSetBorderFillEvent (event) {
    if (event.target.closest('.border-details-container .color-button-main')) {
      this.setBorderFill(event.target.closest('form'))
    }
  },

  changeSelectColorEvent () {
    if (event.target.closest('.border-details-container .color-button-select')) {
      this.setSelectColor(event.target, event.target.closest('form'))
    }
  },

  setBorderFill (container) {
    const type = container.getElementsByClassName('border-details-container')[0].dataset.type
    const cssFill = RightBorderFillCommon.getFillValue(type)
    const button = container.getElementsByClassName('color-button')[0]
    const buttonFill = button.style.backgroundColor || button.style.backgroundImage
    if (!cssFill && buttonFill) RightBorderFillProperty.updateFill(container, buttonFill)
    this.toggleFill(container.getElementsByClassName('color-button-main')[0])
  },

  toggleFill (button) {
    const container = button.closest('form')
    if (!button.classList.contains('active')) {
      this.showFillContainer(container, button)
      const select = container.getElementsByClassName('color-button-select')[0]
      select.value = 'choose'
    } else {
      RightBorderFillCommon.hideFillContainer(container)
    }
  },

  showFillContainer (container, button) {
    button.classList.add('active')
    const form = HelperDOM.getTemplate('template-border-fill')
    const type = button.closest('.border-details-container').dataset.type
    this.addPickerToFill(container, form, type)
    // the color picker needs the dom to be updated before we do any color changes
    RightBorderFillForm.buildForm(form, type)
  },

  addPickerToFill (container, form, type) {
    const fill = container.getElementsByClassName('border-fill-container')[0]
    fill.appendChild(form)
    fill.dataset.type = type
  },

  setSelectColor (select, container) {
    if (select.value === 'choose') {
      this.setBorderFill(container)
    } else {
      const type = container.getElementsByClassName('border-details-container')[0].dataset.type
      const properties = RightBorderFillProperty.getAllBorderFillProperties(type, select.value)
      RightCommon.changeStyle(properties)
      RightBorderFillCommon.hideFillContainer(container)
    }
  },

  removeFill (container) {
    // RightBorderFillProperty.updateFill(container, '')
    // RightBorderFillCommon.hideFillContainer(container)
  },

  injectFill (container, type) {
    const select = container.getElementsByClassName('color-button-select')[0]
    const value = RightBorderFillCommon.getFillValue(type)
    if (value.includes('rgb') || value.includes('url')) {
      select.value = 'choose'
      const preview = container.getElementsByClassName('color-button')[0]
      RightBorderFillCommon.setFillValue(preview, value)
    } else if (value) {
      select.value = value
    }
  }
}
