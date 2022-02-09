import ColorPickerCommon from './color-picker/ColorPickerCommon.js'
import ColorPickerGradient from './color-picker/ColorPickerGradient.js'
import ExtendJS from '../helper/ExtendJS.js'

export default {
  _start: false,
  _target: null,
  _data: {},

  getEvents () {
    return {
      mousedown: ['mousedownStartDragEvent'],
      mousemove: ['mousemoveContinueDragEvent'],
      mouseup: ['mouseupEndDragEvent']
    }
  },

  mousedownStartDragEvent (event) {
    if (event.target.classList.contains('fill-color-interaction') && event.detail === 1) {
      this.startDrag(event)
    }
  },

  mousemoveContinueDragEvent (event) {
    if (this._start && event.buttons) {
      this.continueDrag(event)
    }
  },

  mouseupEndDragEvent (event) {
    if (this._start && event.detail === 1) {
      this.endDrag(event)
    }
  },

  startDrag (event) {
    this._start = true
    this._target = event.target.getElementsByClassName('fill-color-element')[0]
    const container = event.target.closest('.color-picker')
    this._data = {
      ...ColorPickerCommon.getColorPickerData(container),
      clientX: event.clientX,
      clientY: event.clientY
    }
    this.setMoveElement(this._target.dataset.type, this._data, event, { temp: true })
  },

  continueDrag (event) {
    this._data.clientX = event.clientX
    this._data.clientY = event.clientY
    this.setMoveElement(this._target.dataset.type, this._data, event, { temp: true })
  },

  endDrag (event) {
    this.setMoveElement(this._target.dataset.type, this._data, event, { temp: true, apply: true })
    this.clearState()
  },

  clearState () {
    // it's important to clear our state at the end, otherwise we have leftovers spilling
    this._start = false
    this._target = null
    this._data = {}
  },

  setMoveElement (type, data, event, options = {}) {
    if (!['palette', 'hue', 'alpha', 'gradient'].includes(type)) return
    this['set' + ExtendJS.capitalize(type)](data, event)
    ColorPickerCommon.triggerColorChangeEvent(data.container, options)
  },

  setPalette (data) {
    this.updatePalettePin(data)
    this.setSaturation(data)
    this.setValue(data)
    this.setColor(data)
  },

  updatePalettePin (data) {
    data.palettePin.style.left = ColorPickerCommon.getPinX(data.palette, data) + 'px'
    data.palettePin.style.top = ColorPickerCommon.getPinY(data.palette, data) + 'px'
  },

  setSaturation (data) {
    data.palette.dataset.saturation = this.calculateSaturation(data)
  },

  calculateSaturation (data) {
    const pin = ColorPickerCommon.getPinX(data.palette, data)
    const x = this.normalizeX(pin, data.palettePin)
    return parseFloat(x / data.palette.clientWidth)
  },

  normalizeX (x, pin) {
    return x + pin.clientWidth / 2
  },

  setValue (data) {
    data.palette.dataset.value = this.calculateValue(data)
  },

  calculateValue (data) {
    const pin = ColorPickerCommon.getPinY(data.palette, data)
    const y = this.normalizeY(pin, data.palettePin)
    return parseFloat((data.palette.clientHeight - y) / data.palette.clientHeight)
  },

  normalizeY (y, pin) {
    return y + pin.clientHeight / 2
  },

  setColor (data) {
    const color = ColorPickerCommon.getColor(data)
    ColorPickerCommon.updateColorInputs(data.colorInputs, color)
    ColorPickerCommon.setPinColor(data.palettePin, color)
    ColorPickerCommon.setGradientColor(data, color)
  },

  setHue (data) {
    ColorPickerCommon.updateVerticalPin(data.hue, data.huePin, data)
    this.setHueValue(data)
    ColorPickerCommon.updateHue(data)
    this.setColor(data)
  },

  setHueValue (data) {
    data.hue.dataset.hue = this.calculateHue(data)
  },

  calculateHue (data) {
    const pin = ColorPickerCommon.getPinY(data.hue, data)
    const y = this.normalizeY(pin, data.huePin)
    return parseFloat(y / data.hue.clientHeight)
  },

  setAlpha (data) {
    ColorPickerCommon.updateVerticalPin(data.alpha, data.alphaPin, data)
    this.setAlphaColor(data)
    ColorPickerCommon.setGradientColor(data)
  },

  setAlphaColor (data) {
    const alpha = this.calculateAlpha(data)
    ColorPickerCommon.setAlphaInputValue(data, alpha)
  },

  calculateAlpha (data) {
    const pin = ColorPickerCommon.getPinY(data.alpha, data)
    const y = this.normalizeY(pin, data.alphaPin)
    return parseFloat((data.alpha.clientHeight - y) / data.alpha.clientHeight)
  },

  setGradient (data, event) {
    ColorPickerGradient.setGradient(data, event)
  },

  getColorPickerValue (container) {
    const data = ColorPickerCommon.getColorPickerData(container)
    const selectType = container.closest('form').getElementsByClassName('fill-type')[0]
    const fillType = selectType ? selectType.value : 'solid-color'
    switch (fillType) {
      case 'solid-color':
        return ColorPickerCommon.getRgbColor(data)

      case 'linear-gradient':
        return ColorPickerGradient.getGradientBackground(data, 'linear')

      case 'radial-gradient':
        return ColorPickerGradient.getGradientBackground(data, 'radial')

      case 'image':
        return ColorPickerGradient.getBackgroundImage(container)
    }
  }
}
