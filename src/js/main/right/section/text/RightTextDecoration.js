import CheckButtonField from '../../../../component/CheckButtonField.js'
import StateStyleSheet from '../../../../state/StateStyleSheet.js'
import ColorPickerButton from '../../../../component/color-picker/ColorPickerButton.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import ColorPicker from '../../../../component/ColorPicker.js'
import ColorPickerCommon from '../../../../component/color-picker/ColorPickerCommon.js'
import RightCommon from '../../RightCommon.js'
import RightTextCommon from './RightTextCommon.js'

export default {
  getEvents () {
    return {
      click: ['clickSetDecorationEvent', 'clickAddColorEvent', 'clickRemoveColorEvent'],
      colorchange: ['colorChangeDecorationColorEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickSetDecorationEvent (event) {
    if (event.target.closest('button.text-decoration')) {
      this.setDecoration(event.target.closest('button'))
    }
  },

  clickAddColorEvent (event) {
    if (event.target.closest('.text-decoration-color-button .color-button-on')) {
      RightTextCommon.switchTextColor(event.target.closest('form'), 'decoration-color')
    }
  },

  clickRemoveColorEvent (event) {
    if (event.target.closest('.text-decoration-color-button .color-button-off')) {
      RightCommon.changeStyle({ 'text-decoration-color': '' })
    }
  },

  colorChangeDecorationColorEvent (event) {
    if (event.target.closest('.text-decoration-color-container .color-picker')) {
      this.changeDecorationColor(event.target, event.detail)
    }
  },

  setDecoration (button) {
    const value = this.getButtonsValue(button.parentNode)
    this.changeStyleDecoration(value)
    this.toggleDetails(button.closest('form'), value)
  },

  getButtonsValue (container) {
    let value = ''
    for (const button of container.getElementsByTagName('button')) {
      value += value ? ' ' : ''
      value += CheckButtonField.getValue(button)
    }
    return value
  },

  changeStyleDecoration (value) {
    RightCommon.changeStyle({
      'text-decoration-line': value
    })
  },

  changeDecorationColor (container, options = {}) {
    const color = ColorPicker.getColorPickerValue(container)
    const section = container.closest('#text-section')
    RightTextCommon.getColorButton(section, 'decoration-color').style.backgroundColor = color
    ColorPickerCommon.setColor({ 'text-decoration-color': color }, options)
  },

  injectTextDecorationLine (container) {
    const values = this.getStyleValues()
    this.activateButtonsContainer(container, values)
    RightTextCommon.injectTextColor(container, 'decoration-color')
  },

  getStyleValues () {
    const value = StateStyleSheet.getPropertyValue('text-decoration-line')
    return value ? value.split(' ') : []
  },

  activateButtonsContainer (container, values) {
    if (values.length) this.activateButtons(container, values)
    this.toggleDetails(container, values.length)
  },

  activateButtons (container, values) {
    for (const button of container.getElementsByClassName('text-decoration')) {
      if (values.includes(button.value)) button.classList.add('selected')
    }
  },

  toggleDetails (container, visible) {
    const block = container.getElementsByClassName('text-decoration-details')[0]
    HelperDOM.toggle(block, visible)
    this.hideColorPicker(container)
  },

  hideColorPicker (section) {
    const container = section.getElementsByClassName('text-decoration-color-container')[0]
    const button = section.querySelector('.text-decoration-details .color-button-main')
    ColorPickerButton.hideColorPicker(container, button)
  }
}
