import ChangeStyleField from '../../../../component/ChangeStyleField.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import ColorPicker from '../../../../component/ColorPicker.js'
import ColorPickerCommon from '../../../../component/color-picker/ColorPickerCommon.js'
import RightCommon from '../../RightCommon.js'
import StateStyleSheet from '../../../../state/StateStyleSheet.js'

export default {
  getEvents () {
    return {
      click: ['clickAddColorEvent', 'clickRemoveColorEvent'],
      change: ['changeUpdateCustomPropertyEvent'],
      colorchange: ['colorchangeUpdateValueEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickAddColorEvent (event) {
    if (event.target.closest('.style-css-color-button .color-button-main')) {
      this.switchColor(event.target.closest('li'))
    }
  },

  clickRemoveColorEvent (event) {
    if (event.target.closest('.style-css-color-button .color-button-off')) {
      this.removeColor(event.target.closest('li'))
    }
  },

  changeUpdateCustomPropertyEvent (event) {
    if (event.target.classList.contains('css-property')) {
      this.updateCustomProperty(event.target)
    }
  },

  colorchangeUpdateValueEvent (event) {
    if (event.target.closest('#css-section .color-picker')) {
      this.setColorValue(event.target, event.detail)
    }
  },

  switchColor (li) {
    const input = li.getElementsByClassName('change-style')[0]
    const cssColor = StateStyleSheet.getPropertyValue(input.name)
    const buttonColor = li.getElementsByClassName('color-button')[0].style.backgroundColor
    if (cssColor !== 'inherit' || !buttonColor) return
    input.value = buttonColor
    this.setProperty(input)
  },

  removeColor (li) {
    const input = li.getElementsByClassName('change-style')[0]
    input.value = 'inherit'
    this.setProperty(input)
  },

  setProperty (field) {
    RightCommon.changeStyle({
      [field.name]: ChangeStyleField.getValue(field)
    })
  },

  removeProperty (name) {
    RightCommon.changeStyle({
      [name]: ''
    })
  },

  updateCustomProperty (input) {
    const field = input.closest('li').getElementsByClassName('change-style')[0]
    field.name = input.value
    this.setProperty(field)
  },

  setColorValue (container, options = {}) {
    const color = ColorPicker.getColorPickerValue(container)
    const element = container.closest('li')
    element.getElementsByClassName('color-button')[0].style.backgroundColor = color
    const input = element.getElementsByClassName('change-style')[0]
    input.value = color
    ColorPickerCommon.setColor({ [input.name]: color }, options)
  }
}
