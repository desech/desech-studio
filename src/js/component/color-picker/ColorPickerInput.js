import HelperDOM from '../../helper/HelperDOM.js'
import HelperColor from '../../helper/HelperColor.js'
import HelperEvent from '../../helper/HelperEvent.js'
import ColorPickerCommon from './ColorPickerCommon.js'

export default {
  getEvents () {
    return {
      change: ['changeHexInputEvent', 'changeRgbInputEvent', 'changeHslInputEvent',
        'changeHsvInputEvent', 'changeAlphaInputEvent', 'changeColorTypeEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  changeColorTypeEvent (event) {
    if (event.target.classList.contains('fill-color-type')) {
      this.changeColorType(event.target)
    }
  },

  changeHexInputEvent (event) {
    if (event.target.classList.contains('color-hex-input')) {
      this.inputHexInput(event.target)
    }
  },

  changeRgbInputEvent (event) {
    if (event.target.classList.contains('color-rgb-input')) {
      this.inputRgbInput(event.target)
    }
  },

  changeHslInputEvent (event) {
    if (event.target.classList.contains('color-hsl-input')) {
      this.inputHslInput(event.target)
    }
  },

  changeHsvInputEvent (event) {
    if (event.target.classList.contains('color-hsv-input')) {
      this.inputHsvInput(event.target)
    }
  },

  changeAlphaInputEvent (event) {
    if (event.target.classList.contains('color-alpha')) {
      this.inputAlphaInput(event.target)
    }
  },

  changeColorType (select) {
    const container = select.nextElementSibling
    this.selectColorTypeContainer(container, select.value)
  },

  selectColorTypeContainer (container, type) {
    HelperDOM.hide(container.children)
    HelperDOM.show(container.getElementsByClassName('color-' + type)[0])
  },

  inputHexInput (input) {
    const container = input.closest('.color-picker')
    const data = ColorPickerCommon.getColorPickerData(container)
    const color = this.getColorsByHex(input.value, data)
    if (color) {
      ColorPickerCommon.updateColorPicker(container, color)
      ColorPickerCommon.triggerColorChangeEvent(container)
    }
  },

  getColorsByHex (value, data) {
    if (HelperColor.validateHex('#' + value)) {
      const color = { hex: value }
      color.rgb = HelperColor.hexToRgb(color.hex)
      color.hsl = HelperColor.rgbToHsl(...color.rgb)
      color.hsv = HelperColor.rgbToHsv(...color.rgb)
      color.alpha = ColorPickerCommon.getAlpha(data)
      return color
    }
  },

  inputRgbInput (input) {
    this.updateRgbInput(input)
  },

  updateRgbInput (input, trigger = true) {
    const color = { rgb: this.extractRgbValues(input.parentNode.children) }
    if (HelperColor.validateRgb(color.rgb[0], color.rgb[1], color.rgb[2])) {
      color.hex = HelperColor.rgbToHex(...color.rgb)
      color.hsl = HelperColor.rgbToHsl(...color.rgb)
      color.hsv = HelperColor.rgbToHsv(...color.rgb)
      const container = input.closest('.color-picker')
      const data = ColorPickerCommon.getColorPickerData(container)
      color.alpha = ColorPickerCommon.getAlpha(data)
      ColorPickerCommon.updateColorPicker(container, color)
      if (trigger) {
        ColorPickerCommon.triggerColorChangeEvent(container)
      }
    }
  },

  extractRgbValues (inputs) {
    return [
      inputs[0].value,
      inputs[1].value,
      inputs[2].value
    ]
  },

  setRgbInputs (inputs, rgb) {
    inputs[0].value = rgb[0]
    inputs[1].value = rgb[1]
    inputs[2].value = rgb[2]
  },

  inputHslInput (input) {
    this.updateHslInput(input)
  },

  updateHslInput (input) {
    const color = { hsl: this.extractHslvValues(input.parentNode.children) }
    if (HelperColor.validateHslHsv(color.hsl[0], color.hsl[1], color.hsl[2])) {
      color.rgb = HelperColor.hslToRgb(...color.hsl)
      color.hex = HelperColor.rgbToHex(...color.rgb)
      color.hsv = HelperColor.rgbToHsv(...color.rgb)
      const container = input.closest('.color-picker')
      const data = ColorPickerCommon.getColorPickerData(container)
      color.alpha = ColorPickerCommon.getAlpha(data)
      ColorPickerCommon.updateColorPicker(container, color)
      ColorPickerCommon.triggerColorChangeEvent(container)
    }
  },

  extractHslvValues (inputs) {
    return [
      inputs[0].value / 360,
      inputs[1].value / 100,
      inputs[2].value / 100
    ]
  },

  inputHsvInput (input) {
    this.updateHsvInput(input)
  },

  updateHsvInput (input) {
    const color = { hsv: this.extractHslvValues(input.parentNode.children) }
    if (HelperColor.validateHslHsv(color.hsv[0], color.hsv[1], color.hsv[2])) {
      color.rgb = HelperColor.hsvToRgb(...color.hsv)
      color.hex = HelperColor.rgbToHex(...color.rgb)
      color.hsl = HelperColor.rgbToHsl(...color.rgb)
      const container = input.closest('.color-picker')
      const data = ColorPickerCommon.getColorPickerData(container)
      color.alpha = ColorPickerCommon.getAlpha(data)
      ColorPickerCommon.updateColorPicker(container, color)
      ColorPickerCommon.triggerColorChangeEvent(container)
    }
  },

  inputAlphaInput (input) {
    this.updateAlphaInput(input)
  },

  updateAlphaInput (input) {
    if (HelperColor.validateAlpha(input.value)) {
      const container = input.closest('.color-picker')
      this.updateAlphaPicker(container, input.value / 100)
      const data = ColorPickerCommon.getColorPickerData(container)
      ColorPickerCommon.setGradientColor(data)
      ColorPickerCommon.triggerColorChangeEvent(container)
    }
  },

  updateAlphaPicker (container, alpha) {
    const data = ColorPickerCommon.getColorPickerData(container)
    data.alpha.dataset.alpha = alpha
    ColorPickerCommon.positionAlphaPin(data)
  },

  setAlpha (data, float) {
    data.alpha.dataset.alpha = float
    data.colorAlpha.value = float * 100
  },

  getHexColor (container) {
    const input = this.getHexInput(container)
    return '#' + input.value
  },

  getHexInput (container) {
    return container.getElementsByClassName('color-hex-input')[0]
  },

  getRgbColor (container) {
    const rgb = this.getRgbArray(container)
    const alpha = this.getAlpha(container)
    return HelperColor.rgbToCss(rgb, alpha)
  },

  getRgbArray (container) {
    const inputs = container.getElementsByClassName('color-rgb-input')
    return this.extractRgbValues(inputs)
  },

  getAlpha (container) {
    const alpha = container.getElementsByClassName('fill-color-alpha')[0]
    return ColorPickerCommon.getAlphaValue(alpha.dataset.alpha)
  }
}
