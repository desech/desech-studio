import HelperColor from '../../../../helper/HelperColor.js'
import ColorPickerSolidColor from '../../../../component/color-picker/ColorPickerSolidColor.js'
import ColorPicker from '../../../../component/ColorPicker.js'
import StateStyleSheet from '../../../../state/StateStyleSheet.js'
import HelperParserBackground from '../../../../helper/parser/HelperParserBackground.js'
import HelperStyle from '../../../../helper/HelperStyle.js'
import ExtendJS from '../../../../helper/ExtendJS.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import RightFillCommon from './RightFillCommon.js'
import ColorPickerCommon from '../../../../component/color-picker/ColorPickerCommon.js'
import RightCommon from '../../RightCommon.js'
import HelperCanvas from '../../../../helper/HelperCanvas.js'
import StyleSheetCommon from '../../../../state/stylesheet/StyleSheetCommon.js'
import StyleSheetSelector from '../../../../state/stylesheet/StyleSheetSelector.js'
import ColorPickerGradient from '../../../../component/color-picker/ColorPickerGradient.js'

export default {
  getEvents () {
    return {
      colorchange: ['changecolorEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  changecolorEvent (event) {
    if (event.target.closest('.background-fill-container .color-picker')) {
      this.updateBackgroundImage(event.target.closest('form.slide-container'), event.detail)
    }
  },

  updateBackgroundImage (form, options = {}) {
    const main = form.closest('#fill-section')
    const elem = RightFillCommon.getActiveElement(main)
    const index = HelperDOM.getElementIndex(elem)
    const value = this.getBackgroundValue(form)
    ColorPickerCommon.setColor({
      'background-image': this.replaceBackgroundAtIndex(value, index)
    }, options)
    RightFillCommon.setElementData(elem, value)
  },

  getBackgroundValue (form) {
    const picker = form.getElementsByClassName('color-picker')[0]
    const value = picker ? ColorPicker.getColorPickerValue(picker) : this.getEmptyBackgroundValue(form)
    if (HelperColor.isSolidColor(value)) {
      return HelperColor.getBackgroundSolidColor(value) // convert solid color to gradient so it can be used as bgimage and sorted in the list
    } else {
      return value
    }
  },

  getEmptyBackgroundValue (form) {
    const image = ColorPickerGradient.getBackgroundImage(form)
    return image || 'rgb(0, 0, 0)'
  },

  replaceBackgroundAtIndex (background, index) {
    const backgrounds = this.getBackgrounds()
    backgrounds[index] = background
    return backgrounds.join(', ')
  },

  getBackgrounds (selector = null) {
    const source = StateStyleSheet.getPropertyValue('background-image', selector)
    return HelperParserBackground.getBackgroundValues(source)
  },

  getBackgroundAtIndex (index) {
    const backgrounds = this.getBackgrounds()
    return backgrounds[index] || ''
  },

  getBackgroundData (index) {
    const value = this.getBackgroundAtIndex(index)
    const finalValue = HelperParserBackground.convertBgToColor(value)
    return {
      value: finalValue,
      type: HelperStyle.getBackgroundType(finalValue)
    }
  },

  getBackgroundPropertyAtIndex (selector, property, index) {
    const values = StateStyleSheet.getPropertyValue(property, selector)
    return values ? values.split(',')[index].trim() : ''
  },

  replaceBackgroundPropertyAtIndex (property, index, value) {
    if (!value) throw new Error('Background value missing')
    const fullValue = StateStyleSheet.getPropertyValue(property)
    const parts = fullValue.split(',')
    parts[index] = value
    return parts.join(', ')
  },

  insertBackgroundProperty (property, selector, index = null) {
    const value = StateStyleSheet.getPropertyValue(property, selector)
    const parts = value ? value.split(', ') : []
    parts[index || parts.length] = HelperStyle.getDefaultProperty(property)
    StyleSheetCommon.addRemoveStyleRules({
      selector,
      responsive: HelperCanvas.getCurrentResponsiveWidth(),
      properties: {
        [property]: parts.join(', ')
      }
    }, true)
  },

  deleteBackgroundFill (index) {
    const properties = {}
    const selector = StyleSheetSelector.getCurrentSelector()
    for (const property of ['image', 'size', 'position', 'repeat', 'attachment', 'origin', 'blend-mode']) {
      properties['background-' + property] = this.removeBackgroundProperty('background-' + property, selector, index)
    }
    RightCommon.changeStyle(properties)
  },

  removeBackgroundProperty (property, selector, index) {
    const values = this.getBackgroundPropertyArray(property, selector)
    values.splice(index, 1)
    return values.join(',').trim()
  },

  getBackgroundPropertyArray (property, selector) {
    return (property === 'background-image') ? this.getBackgrounds(selector) : StateStyleSheet.getPropertyValue(property, selector).split(',')
  },

  sortBackgroundFill (from, to) {
    const properties = {}
    const selector = StyleSheetSelector.getCurrentSelector()
    for (const property of ['image', 'size', 'position', 'repeat', 'attachment', 'origin', 'blend-mode']) {
      properties['background-' + property] = this.replaceBackgroundProperty('background-' + property, selector, from, to)
    }
    RightCommon.changeStyle(properties)
  },

  replaceBackgroundProperty (property, selector, from, to) {
    const values = this.getBackgroundPropertyArray(property, selector)
    const sorted = ExtendJS.insertAndShift(values, from, to)
    return sorted.join(',').trim()
  },

  injectColor (container, value) {
    if (value) {
      const rgb = HelperColor.extractRgb(value)
      ColorPickerSolidColor.injectColor(container, rgb)
    }
  }
}
