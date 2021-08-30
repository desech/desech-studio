import HelperDOM from '../../helper/HelperDOM.js'
import HelperColor from '../../helper/HelperColor.js'
import HelperEvent from '../../helper/HelperEvent.js'
import ChangeStyleField from '../ChangeStyleField.js'
import ColorPickerCommon from './ColorPickerCommon.js'
import HelperProject from '../../helper/HelperProject.js'

export default {
  getEvents () {
    return {
      click: ['clickRepeatingButtonEvent'],
      dblclick: ['dblclickDeletePinEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickRepeatingButtonEvent (event) {
    if (event.target.closest('.repeat-gradient-button')) {
      this.clickRepeatingButton(event.target.closest('.repeat-gradient-button'))
    }
  },

  dblclickDeletePinEvent (event) {
    if (event.target.classList.contains('fill-color-interaction') &&
      event.target.getElementsByClassName('fill-color-gradient')[0]) {
      this.deletePin(event.target.closest('.color-picker'), event.clientX)
    }
  },

  deletePin (container, clientX) {
    const data = {
      ...ColorPickerCommon.getColorPickerData(container),
      clientX
    }
    const pin = this.findClickedPin(data)
    if (!pin || !this.canDeletePin(data.gradient)) return
    pin.remove()
    this.selectFirstPin(data.gradient)
    ColorPickerCommon.triggerColorChangeEvent(container)
  },

  findClickedPin (data) {
    const range = this.getMousePinRange(data)
    return this.findPinOnPosition(data.gradient, range)
  },

  canDeletePin (container) {
    return ColorPickerCommon.getPins(container).length > 2
  },

  selectFirstPin (container) {
    const pin = ColorPickerCommon.getPins(container)[0]
    this.selectPin(pin)
  },

  clickRepeatingButton (button) {
    this.toggleRepeatingGradient(button)
    ColorPickerCommon.triggerColorChangeEvent(button.closest('.color-picker'))
  },

  toggleRepeatingGradient (button) {
    const fill = button.previousElementSibling.children[0]
    if (ColorPickerCommon.isRepeatingGradient(button)) {
      this.enableRepeatingGradient(fill)
    } else {
      this.disableRepeatingGradient(fill)
    }
  },

  enableRepeatingGradient (fill) {
    fill.style.backgroundImage = fill.style.backgroundImage
      .replace('linear-gradient', 'repeating-linear-gradient')
  },

  disableRepeatingGradient (fill) {
    fill.style.backgroundImage = fill.style.backgroundImage
      .replace('repeating-linear-gradient', 'linear-gradient')
  },

  setGradient (data, event) {
    if (event.type === 'mousedown') {
      this.setGradientStart(data)
    }
    this.setGradientMove(data)
  },

  setGradientStart (data) {
    const range = this.getMousePinRange(data)
    const pin = this.findPinOnPosition(data.gradient, range) ||
      this.createPin(data.gradient, range[0])
    this.selectPin(pin)
  },

  getMousePinRange (data) {
    const mousePinPos = ColorPickerCommon.getPinX(data.gradient, data)
    return [
      mousePinPos - ColorPickerCommon.getPinWidth() / 2,
      mousePinPos + ColorPickerCommon.getPinWidth() / 2
    ]
  },

  findPinOnPosition (container, range) {
    for (const pin of ColorPickerCommon.getPins(container)) {
      if (pin.offsetLeft >= range[0] && pin.offsetLeft <= range[1]) {
        return pin
      }
    }
  },

  createPin (container, pos, color = '') {
    const pin = this.preparePin(pos, color)
    container.appendChild(pin)
    return pin
  },

  preparePin (pos, color) {
    const template = HelperDOM.getTemplate('template-color-picker-pin')
    template.style.left = pos + 'px'
    template.style.backgroundColor = color || 'rgb(0, 0, 0)'
    return template
  },

  selectPin (pin) {
    this.activatePin(pin)
    ColorPickerCommon.updateColorPicker(pin.closest('.color-picker'), this.getPinColor(pin))
  },

  activatePin (pin) {
    const active = pin.parentNode.querySelector('.active')
    if (active) {
      active.classList.remove('active')
    }
    pin.classList.add('active')
  },

  getPinColor (pin) {
    const rgb = HelperColor.extractRgb(pin.style.backgroundColor)
    return this.getColorsByRgb(rgb)
  },

  getColorsByRgb (rgb) {
    return {
      rgb: rgb,
      hex: HelperColor.rgbToHex(...rgb),
      hsl: HelperColor.rgbToHsl(...rgb),
      hsv: HelperColor.rgbToHsv(...rgb),
      alpha: rgb[3] || 1
    }
  },

  setGradientMove (data) {
    const activePin = ColorPickerCommon.getActivePin(data.gradient)
    ColorPickerCommon.updateHorizontalPin(data.gradient, activePin, data)
    ColorPickerCommon.updateGradientFill(data)
  },

  getGradientBackground (data, type) {
    const pins = ColorPickerCommon.getPins(data.gradient)
    const pinData = ColorPickerCommon.extractDataFromPins(pins)
    return ColorPickerCommon.getGradientFillBackground(data, pinData, type)
  },

  getBackgroundImage (container) {
    const source = container.getElementsByClassName('image-source')[0]
    return source ? source.style.backgroundImage : ''
  },

  setBackgroundImageSource (container, file) {
    // file is already encoded
    const source = container.getElementsByClassName('image-source')[0]
    source.style.backgroundImage = `url("${file}")`
    const field = container.getElementsByClassName('picker-source-name')[0]
    field.value = decodeURI(file)
    field.textContent = decodeURI(HelperProject.getFileName(file))
  },

  injectGradient (container, gradientData) {
    const picker = container.getElementsByClassName('color-picker')[0]
    const colorData = ColorPickerCommon.getColorPickerData(picker)
    this.injectPins(colorData.gradient, gradientData.colors)
    this.injectRepeatingGradient(colorData.repeatingGradient, gradientData.repeating)
    ColorPickerCommon.updateGradientFill(colorData)
  },

  injectPins (gradient, colors) {
    this.clearPins(gradient)
    this.addPins(gradient, colors)
  },

  clearPins (container) {
    HelperDOM.deleteChildren(container)
  },

  addPins (container, colors) {
    for (let i = 0; i < colors.length; i++) {
      const pos = this.convertPinPercentToPx(colors[i].position, container)
      const pin = this.createPin(container, pos, colors[i].rgb)
      if (i === 0) this.selectPin(pin)
    }
  },

  convertPinPercentToPx (percent, container) {
    const halfPin = ColorPickerCommon.getPinWidth() / 2
    return (container.clientWidth * parseInt(percent) / 100) - halfPin
  },

  injectRepeatingGradient (button, value) {
    if (value) button.classList.add('selected')
  },

  injectGradientForm (container, data) {
    const form = container.getElementsByClassName('gradient-form')[0]
    for (const field of form) {
      const value = data.line[field.name] || ''
      ChangeStyleField.setValue(field, value)
    }
  },

  injectRadialSizeToggle (container, line) {
    const size = container.getElementsByClassName('gradient-size-length')[0]
    if (size) HelperDOM.toggle(size, line.size === 'length')
  }
}
