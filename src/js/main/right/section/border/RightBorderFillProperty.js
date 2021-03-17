import HelperColor from '../../../../helper/HelperColor.js'
import ColorPicker from '../../../../component/ColorPicker.js'
import ColorPickerSolidColor from '../../../../component/color-picker/ColorPickerSolidColor.js'
import StateStyleSheet from '../../../../state/StateStyleSheet.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import RightBorderFillCommon from './RightBorderFillCommon.js'
import ColorPickerCommon from '../../../../component/color-picker/ColorPickerCommon.js'
import RightCommon from '../../RightCommon.js'

export default {
  getEvents () {
    return {
      change: ['changeBorderStyleEvent'],
      colorchange: ['changecolorEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  changecolorEvent (event) {
    if (event.target.closest('.border-fill-container .color-picker')) {
      this.changeFill(event.target, event.detail)
    }
  },

  changeBorderStyleEvent (event) {
    if (event.target.classList.contains('border-style-select')) {
      this.changeBorderStyle(event.target)
    }
  },

  changeFill (picker, options = {}) {
    const value = ColorPicker.getColorPickerValue(picker)
    const container = picker.closest('#border-section')
    this.updatePreviewSwatch(container, value)
    this.updateFill(container, value, options)
  },

  updateFill (container, value, options = {}) {
    const type = container.getElementsByClassName('border-details-container')[0].dataset.type
    const properties = this.getBorderFillProperties(type, value)
    ColorPickerCommon.setColor(properties, options) // we don't use the properties when we apply the temporary style (we take them from style, directly)
  },

  updatePreviewSwatch (container, fill) {
    const preview = container.getElementsByClassName('color-button')[0]
    RightBorderFillCommon.setFillValue(preview, fill)
  },

  getBorderFillProperties (borderType, value) {
    if (HelperColor.isSolidColor(value)) {
      return {
        ...this.getBorderFillPropertiesColor(borderType, value),
        'border-image-source': ''
      }
    } else { // gradient or image
      return {
        ...this.getBorderFillPropertiesColor(borderType, ''),
        'border-image-source': value
      }
    }
  },

  getBorderFillPropertiesColor (borderType, value) {
    return (borderType === 'all') ? {
      'border-top-color': value,
      'border-bottom-color': value,
      'border-left-color': value,
      'border-right-color': value
    } : {
      [`border-${borderType}-color`]: value
    }
  },

  changeBorderStyle (select) {
    const type = select.closest('.border-fill-container').dataset.type
    const properties = this.getBorderStyleProperties(type, select.value)
    RightCommon.changeStyle(properties)
  },

  getBorderStyleProperties (borderType, value = '') {
    return (borderType === 'all') ? {
      'border-top-style': value,
      'border-bottom-style': value,
      'border-left-style': value,
      'border-right-style': value
    } : {
      [`border-${borderType}-style`]: value
    }
  },

  injectColor (container, borderType) {
    const rgb = this.getCssColor(borderType)
    ColorPickerSolidColor.injectColor(container, rgb)
  },

  getCssColor (borderType) {
    const property = (borderType === 'all') ? 'border-top-color' : `border-${borderType}-color`
    const color = StateStyleSheet.getPropertyValue(property)
    return color ? HelperColor.extractRgb(color) : null
  },

  injectBorderStyle (template, borderType, selector) {
    const select = this.getBorderStyleSelect(template)
    const properties = this.getBorderStyleProperties(borderType)
    select.value = StateStyleSheet.getPropertyValue(Object.keys(properties)[0], selector) // there's only 1 property for border sides and 4 properties for all (only need the 1st one)
  },

  getBorderStyleSelect (container) {
    return container.getElementsByClassName('border-style-select')[0]
  }
}
