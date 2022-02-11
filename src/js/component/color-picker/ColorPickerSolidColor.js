import ColorPickerInput from './ColorPickerInput.js'
import ColorPickerCommon from './ColorPickerCommon.js'

export default {
  // only works when the color picker is visible, so watch out for templates
  injectColor (container, rgb) {
    if (!rgb) return
    const inputs = container.getElementsByClassName('color-rgb-input')
    ColorPickerInput.setRgbInputs(inputs, rgb)
    if (rgb[3]) this.injectAlpha(container, rgb[3])
    ColorPickerInput.updateRgbInput(inputs[0], false)
  },

  injectAlpha (container, alpha) {
    const picker = container.getElementsByClassName('color-picker')[0]
    const data = ColorPickerCommon.getColorPickerData(picker)
    ColorPickerInput.setAlpha(data, alpha)
  }
}
