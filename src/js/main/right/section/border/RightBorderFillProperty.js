import HelperColor from '../../../../helper/HelperColor.js'
import ColorPicker from '../../../../component/ColorPicker.js'
import ColorPickerSolidColor from '../../../../component/color-picker/ColorPickerSolidColor.js'
import StateStyleSheet from '../../../../state/StateStyleSheet.js'
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

  changecolorEvent (event) {
    if (event.target.closest('.border-fill-container .color-picker')) {
      this.changeFill(event.target, event.detail)
    }
  },

  async changeBorderStyleEvent (event) {
    if (event.target.classList.contains('border-style-select')) {
      await this.changeBorderStyle(event.target)
    }
  },

  async changeFill (picker, options = {}) {
    const value = ColorPicker.getColorPickerValue(picker)
    const container = picker.closest('#border-section')
    this.updatePreviewSwatch(container, value)
    await this.updateFill(container, value, options)
  },

  async updateFill (container, value, options = {}) {
    const type = container.getElementsByClassName('border-details-container')[0].dataset.type
    const properties = this.getBorderFillProperties(type, value)
    // we don't use the properties when we apply the temporary style,
    // we take them from style, directly
    await ColorPickerCommon.setColor(properties, options)
  },

  updatePreviewSwatch (container, fill) {
    const preview = container.getElementsByClassName('color-button')[0]
    RightBorderFillCommon.setFillValue(preview, fill)
  },

  getBorderFillProperties (borderType, value) {
    if (HelperColor.isSolidColor(value)) {
      return {
        ...this.getBorderFillPropertiesByName(borderType, value, 'color'),
        'border-image-source': ''
      }
    } else {
      // gradient or image
      return {
        ...this.getBorderFillPropertiesByName(borderType, '', 'color'),
        'border-image-source': value
      }
    }
  },

  getAllBorderFillProperties (borderType, value) {
    return {
      ...this.getBorderFillPropertiesByName(borderType, value, 'color'),
      'border-image-source': value
    }
  },

  getBorderFillPropertiesByName (borderType, value, name) {
    if (borderType === 'all') {
      return {
        [`border-top-${name}`]: value,
        [`border-bottom-${name}`]: value,
        [`border-left-${name}`]: value,
        [`border-right-${name}`]: value
      }
    } else {
      return { [`border-${borderType}-${name}`]: value }
    }
  },

  async changeBorderStyle (select) {
    const type = select.closest('.border-fill-container').dataset.type
    const properties = this.getBorderFillPropertiesByName(type, select.value, 'style')
    await RightCommon.changeStyle(properties)
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
    const properties = this.getBorderFillPropertiesByName(borderType, null, 'style')
    // there's only 1 property for border sides and 4 properties for all (only need the 1st one)
    select.value = StateStyleSheet.getPropertyValue(Object.keys(properties)[0], selector)
  },

  getBorderStyleSelect (container) {
    return container.getElementsByClassName('border-style-select')[0]
  }
}
