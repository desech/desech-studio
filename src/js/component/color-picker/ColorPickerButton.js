import HelperDOM from '../../helper/HelperDOM.js'
import ColorPickerSwatch from './ColorPickerSwatch.js'
import HelperColor from '../../helper/HelperColor.js'
import ColorPickerSolidColor from './ColorPickerSolidColor.js'
import StateStyleSheet from '../../state/StateStyleSheet.js'
import ColorPicker from '../ColorPicker.js'
import ColorPickerCommon from './ColorPickerCommon.js'
import RightCommon from '../../main/right/RightCommon.js'
import StyleSheetVariable from '../../state/stylesheet/StyleSheetVariable.js'

export default {
  getEvents () {
    return {
      click: ['clickButtonEvent'],
      change: ['changeSelectColorEvent'],
      colorchange: ['colorChangeColorEvent']
    }
  },

  async clickButtonEvent (event) {
    const query = '.color-button-wrapper:not([data-no-interact]) .color-button-main'
    if (event.target.closest(query)) {
      await this.toggleButton(event.target.closest('.color-button-wrapper'))
    }
  },

  async changeSelectColorEvent (event) {
    const query = '.color-button-wrapper:not([data-no-interact]) .color-button-select'
    if (event.target.closest(query)) {
      await this.setSelectColor(event.target.closest('.color-button-wrapper'))
    }
  },

  async colorChangeColorEvent (event) {
    if (event.target.closest('.color-button-wrapper:not([data-no-interact]) .color-picker')) {
      await this.changeColor(event.target.closest('.color-button-wrapper'), event.detail)
    }
  },

  // it's not just nodes, but also some data
  getNodes (container) {
    return {
      property: container.dataset.property,
      select: container.getElementsByClassName('color-button-select')[0],
      buttonMain: container.getElementsByClassName('color-button-main')[0],
      button: container.getElementsByClassName('color-button')[0],
      pickerContainer: container.getElementsByClassName('color-button-picker')[0],
      picker: container.getElementsByClassName('color-picker')[0]
    }
  },

  injectPropertyColor (container, style = null) {
    const nodes = this.getNodes(container)
    const color = this.getStyleColor(nodes.property, style)
    if (color && (color.startsWith('rgb'))) {
      nodes.select.value = 'choose'
      nodes.button.style.backgroundColor = color
    } else if (color) {
      nodes.select.value = color
    }
  },

  getStyleColor (property, style) {
    let color = style ? style[property] : StateStyleSheet.getPropertyValue(property)
    if (color && color.startsWith('var(--')) {
      color = StyleSheetVariable.getVariableValue(color)
    }
    return color
  },

  async toggleButton (container) {
    const nodes = this.getNodes(container)
    if (!nodes.buttonMain.classList.contains('active')) {
      await this.showColorPicker(nodes, nodes.select.value !== 'choose')
    } else {
      this.hideColorPicker(nodes)
    }
  },

  async showColorPicker (nodes, update) {
    nodes.buttonMain.classList.add('active')
    const colorPicker = this.buildColorPicker(nodes.pickerContainer)
    const color = nodes.button.style.backgroundColor
    this.injectColorInPicker(colorPicker, color)
    if (update) {
      nodes.select.value = 'choose'
      await RightCommon.changeStyle({ [nodes.property]: color })
    }
  },

  buildColorPicker (container) {
    const template = HelperDOM.getTemplate('template-color-picker')
    container.appendChild(template)
    return template
  },

  injectColorInPicker (colorPicker, color) {
    ColorPickerSwatch.injectColors(colorPicker)
    if (color) {
      const rgb = HelperColor.extractRgb(color)
      ColorPickerSolidColor.injectColor(colorPicker, rgb)
    }
  },

  hideColorPicker (nodes) {
    nodes.buttonMain.classList.remove('active')
    HelperDOM.deleteChildren(nodes.pickerContainer)
  },

  async setSelectColor (container) {
    const nodes = this.getNodes(container)
    if (nodes.select.value === 'choose') {
      await this.showColorPicker(nodes, true)
    } else {
      await RightCommon.changeStyle({ [nodes.property]: nodes.select.value })
      this.hideColorPicker(nodes)
    }
  },

  async changeColor (container, options = {}) {
    const nodes = this.getNodes(container)
    const value = this.getChangeColor(nodes.picker, options?.variable)
    nodes.button.style.backgroundColor = value
    await ColorPickerCommon.setColor({ [nodes.property]: value }, options)
  },

  getChangeColor (picker, variable) {
    return variable ? `var(--${variable})` : ColorPicker.getColorPickerValue(picker)
  }
}
