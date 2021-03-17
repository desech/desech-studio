import ExtendJS from '../../helper/ExtendJS.js'
import HelperColor from '../../helper/HelperColor.js'
import InputUnitField from '../InputUnitField.js'
import StateTempStyle from '../../state/StateTempStyle.js'
import RightCommon from '../../main/right/RightCommon.js'

export default {
  getColorPickerData (container) {
    return {
      container: container,
      form: container.closest('.slide-container'),
      palette: container.getElementsByClassName('fill-color-palette')[0],
      palettePin: container.getElementsByClassName('palette-pin')[0],
      hue: container.getElementsByClassName('fill-color-hue')[0],
      huePin: container.getElementsByClassName('hue-pin')[0],
      alpha: container.getElementsByClassName('fill-color-alpha')[0],
      alphaPin: container.getElementsByClassName('alpha-pin')[0],
      colorInputs: container.getElementsByClassName('color-input'),
      colorAlpha: container.getElementsByClassName('color-alpha')[0],
      gradient: container.getElementsByClassName('fill-color-gradient')[0] || null,
      repeatingGradient: container.getElementsByClassName('repeat-gradient-button')[0] || null
    }
  },

  triggerColorChangeEvent (container, detail = {}) {
    const event = new CustomEvent('colorchange', { detail: detail, bubbles: true, cancelable: true })
    container.dispatchEvent(event)
  },

  setColor (properties, options = {}) {
    if (options.temp) {
      options.apply ? StateTempStyle.applyStyleValue() : StateTempStyle.setStyles(properties)
    } else {
      RightCommon.changeStyle(properties)
    }
  },

  getRgbColor (data) {
    const rgb = [data.colorInputs[0].value, data.colorInputs[1].value, data.colorInputs[2].value]
    const alpha = this.getAlpha(data)
    return HelperColor.rgbToCss(rgb, alpha)
  },

  getPinX (container, data) {
    const sidebar = document.getElementById('sidebar-right')
    const panel = document.getElementById('right-panel-style')
    const halfPin = this.getPinWidth() / 2
    let x = (data.clientX - halfPin + panel.scrollLeft) - (sidebar.offsetLeft + container.offsetLeft)
    x = Math.max(x, -halfPin)
    x = Math.min(x, container.clientWidth - halfPin)
    return x
  },

  getPinY (container, data) {
    const sidebar = document.getElementById('sidebar-right')
    const panel = document.getElementById('right-panel-style')
    const halfPin = this.getPinHeight() / 2
    let y = (data.clientY - halfPin + panel.scrollTop) - (sidebar.offsetTop + container.offsetTop)
    y = Math.max(y, -halfPin)
    y = Math.min(y, container.clientHeight - halfPin)
    return y
  },

  getPinWidth () {
    return 14
  },

  getPinHeight () {
    return 14
  },

  getColor (data) {
    const hsv = [this.getHue(data), this.getSaturation(data), this.getValue(data)]
    const rgb = HelperColor.hsvToRgb(...hsv)
    const hex = HelperColor.rgbToHex(...rgb)
    const hsl = HelperColor.rgbToHsl(...rgb)
    const alpha = this.getAlpha(data)
    return { hsv, rgb, hex, hsl, alpha }
  },

  getHue (data) {
    return parseFloat(data.hue.dataset.hue) || 0
  },

  getSaturation (data) {
    return parseFloat(data.palette.dataset.saturation) || 0
  },

  getValue (data) {
    return parseFloat(data.palette.dataset.value) || 0
  },

  getAlpha (data) {
    return this.getAlphaValue(data.alpha.dataset.alpha)
  },

  getAlphaValue (value) {
    return ExtendJS.roundToTwo(value)
  },

  setPinColor (pin, color) {
    pin.style.backgroundColor = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]}, ${color.alpha})`
  },

  updateVerticalPin (container, pin, data) {
    pin.style.top = this.getPinY(container, data) + 'px'
  },

  updateHorizontalPin (container, pin, data) {
    pin.style.left = this.getPinX(container, data) + 'px'
  },

  updateColorPicker (container, color) {
    const data = this.getColorPickerData(container)
    this.updateColorInputs(data.colorInputs, color)
    this.updateColorPanels(data, color)
    this.updateColorPickerAlpha(data, color)
    this.setGradientColor(data, color)
  },

  updateColorInputs (inputs, color) {
    inputs[0].value = color.rgb[0]
    inputs[1].value = color.rgb[1]
    inputs[2].value = color.rgb[2]
    inputs[3].value = color.hex
    inputs[4].value = Math.round(color.hsl[0] * 360)
    inputs[5].value = Math.round(color.hsl[1] * 100)
    inputs[6].value = Math.round(color.hsl[2] * 100)
    inputs[7].value = Math.round(color.hsv[0] * 360)
    inputs[8].value = Math.round(color.hsv[1] * 100)
    inputs[9].value = Math.round(color.hsv[2] * 100)
  },

  updateColorPanels (data, color) {
    this.setColorPanelData(data, color.hsv)
    this.setColorPanelPins(data, color)
  },

  setColorPanelData (data, hsv) {
    data.hue.dataset.hue = hsv[0]
    data.palette.dataset.saturation = hsv[1]
    data.palette.dataset.value = hsv[2]
  },

  setColorPanelPins (data, color) {
    this.positionPalettePin(data)
    this.setPinColor(data.palettePin, color)
    this.positionHuePin(data)
    this.updateHue(data)
  },

  positionPalettePin (data) {
    const x = Math.round(data.palette.clientWidth * this.getSaturation(data) - data.palettePin.clientWidth / 2)
    const y = Math.round(data.palette.clientHeight - this.getValue(data) * data.palette.clientHeight - data.palettePin.clientHeight / 2)
    data.palettePin.style.left = x + 'px'
    data.palettePin.style.top = y + 'px'
  },

  positionHuePin (data) {
    const y = Math.round(data.hue.clientHeight * this.getHue(data) - data.huePin.clientHeight / 2)
    data.huePin.style.top = y + 'px'
  },

  updateHue (data) {
    const rgb = HelperColor.hsvToRgb(this.getHue(data), 1, 1)
    this.setPaletteBackground(data, rgb)
    this.setPinColor(data.huePin, { rgb: rgb, alpha: 1 })
  },

  setPaletteBackground (data, rgb) {
    data.palette.style.backgroundColor = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
  },

  updateColorPickerAlpha (data, color) {
    if (typeof color.alpha !== 'undefined') {
      this.setAlphaInputValue(data, color.alpha)
      this.positionAlphaPin(data)
    }
  },

  setAlphaInputValue (data, value) {
    data.alpha.dataset.alpha = value
    this.setAlphaValue(data.colorAlpha, value)
  },

  setAlphaValue (input, value) {
    input.value = Math.round(value * 100)
  },

  positionAlphaPin (data) {
    const value = this.getAlpha(data)
    const y = Math.round(data.alpha.clientHeight - value * data.alpha.clientHeight - data.alphaPin.clientHeight / 2)
    data.alphaPin.style.top = y + 'px'
  },

  setGradientColor (data, color = null) {
    if (data.gradient) {
      color = color || this.getColor(data)
      const pin = this.getActivePin(data.gradient)
      this.setPinColor(pin, color)
      this.updateGradientFill(data)
    }
  },

  getActivePin (container) {
    for (const pin of this.getPins(container)) {
      if (pin.classList.contains('active')) {
        return pin
      }
    }
  },

  getPins (container) {
    return container.children
  },

  updateGradientFill (data) {
    const pins = this.getPins(data.gradient)
    const pinData = this.extractDataFromPins(pins)
    this.setGradientFillBackground(data, pinData)
  },

  extractDataFromPins (pins) {
    const data = []
    for (const pin of pins) {
      data.push(this.getPinData(pin))
    }
    return this.sortPinsByPosition(data)
  },

  sortPinsByPosition (data) {
    return data.sort((a, b) => a.position - b.position)
  },

  getPinData (pin) {
    return {
      color: pin.style.backgroundColor,
      position: this.getPinPosition(pin)
    }
  },

  getPinPosition (pin) {
    const halfPin = this.getPinWidth() / 2
    return Math.round(((parseInt(pin.style.left) + halfPin) * 100) / pin.parentNode.clientWidth)
  },

  setGradientFillBackground (data, pinData) {
    data.gradient.style.backgroundImage = this.getGradientFillBackground(data, pinData, 'linear', 'to right')
  },

  getGradientFillBackground (data, pinData, type, line = '') {
    // @todo use the bg finder/spliter from fill
    let bg = ''
    for (const pin of pinData) {
      bg += bg ? ', ' : ''
      bg += `${pin.color} ${pin.position}%`
    }
    const repeating = this.isRepeatingGradient(data.repeatingGradient) ? 'repeating-' : ''
    line = line || this.getGradientLine(data.form.getElementsByClassName('gradient-form')[0], type)
    line = line ? line + ', ' : ''
    return `${repeating}${type}-gradient(${line}${bg})`
  },

  isRepeatingGradient (button) {
    return button.classList.contains('selected')
  },

  getGradientLine (form, type) {
    if (type === 'linear') {
      return this.getLinearGradientLine(form.elements)
    } else if (type === 'radial') {
      return this.getRadialGradientLine(form)
    }
    throw new Error('Unknown gradient type')
  },

  getLinearGradientLine (fields) {
    return InputUnitField.getValue(fields.angle) || ''
  },

  getRadialGradientLine (fields) {
    let line = ''
    if (fields.size.value === 'length') {
      line += (InputUnitField.getValue(fields.width) + ' ' + InputUnitField.getValue(fields.height)).trim()
    } else if (fields.size.value) {
      line += fields.size.value
    }
    if (fields.x.value || fields.y.value) line += ' at'
    if (fields.x.value) {
      line += ' ' + InputUnitField.getValue(fields.x)
    }
    if (fields.y.value) {
      line += ' ' + InputUnitField.getValue(fields.y)
    }
    return line.trim()
  }
}
