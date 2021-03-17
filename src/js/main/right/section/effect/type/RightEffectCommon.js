import HelperColor from '../../../../../helper/HelperColor.js'
import ColorPickerSwatch from '../../../../../component/color-picker/ColorPickerSwatch.js'
import ColorPickerSolidColor from '../../../../../component/color-picker/ColorPickerSolidColor.js'

export default {
  getColorHex (color) {
    const rgb = HelperColor.extractRgb(color)
    return '#' + HelperColor.rgbToHex(rgb[0], rgb[1], rgb[2])
  },

  injectColor (container, value) {
    ColorPickerSwatch.injectSwatches(container)
    if (value) {
      const rgb = HelperColor.extractRgb(value)
      ColorPickerSolidColor.injectColor(container, rgb)
    }
  },

  getActiveElement (container) {
    return container.querySelector('.effect-element.active')
  },

  moveActiveElement (section, li, type) {
    const newList = section.getElementsByClassName(`effect-list-${type}`)[0]
    newList.appendChild(li)
  }
}
