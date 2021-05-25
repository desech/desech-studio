import HelperDOM from '../../helper/HelperDOM.js'
import ColorPickerSwatch from './ColorPickerSwatch.js'
import HelperColor from '../../helper/HelperColor.js'
import ColorPickerSolidColor from './ColorPickerSolidColor.js'
import HelperEvent from '../../helper/HelperEvent.js'
import StateStyleSheet from '../../state/StateStyleSheet.js'
import ColorPicker from '../ColorPicker.js'
import ColorPickerCommon from './ColorPickerCommon.js'
import RightCommon from '../../main/right/RightCommon.js'

export default {
  getEvents () {
    return {
      click: ['clickButtonEvent'],
      change: ['changeSelectColorEvent'],
      colorchange: ['colorChangeColorEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickButtonEvent (event) {
    const query = '.color-button-wrapper:not([data-no-interact]) .color-button-main'
    if (event.target.closest(query)) {
      this.toggleButton(event.target.closest('.color-button-wrapper'))
    }
  },

  changeSelectColorEvent () {
    const query = '.color-button-wrapper:not([data-no-interact]) .color-button-select'
    if (event.target.closest(query)) {
      this.setSelectColor(event.target.closest('.color-button-wrapper'))
    }
  },

  colorChangeColorEvent (event) {
    if (event.target.closest('.color-button-wrapper:not([data-no-interact]) .color-picker')) {
      this.changeColor(event.target.closest('.color-button-wrapper'), event.detail)
    }
  },

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

  injectPropertyColor (container) {
    const nodes = this.getNodes(container)
    const color = StateStyleSheet.getPropertyValue(nodes.property)
    if (color.startsWith('rgb')) {
      nodes.select.value = 'choose'
      nodes.button.style.backgroundColor = color
    } else if (color) {
      nodes.select.value = color
    }
  },

  toggleButton (container) {
    const nodes = this.getNodes(container)
    if (!nodes.buttonMain.classList.contains('active')) {
      this.showColorPicker(nodes, nodes.select.value !== 'choose')
    } else {
      this.hideColorPicker(nodes)
    }
  },

  showColorPicker (nodes, update) {
    nodes.buttonMain.classList.add('active')
    const colorPicker = this.buildColorPicker(nodes.pickerContainer)
    const color = nodes.button.style.backgroundColor
    this.injectColorInPicker(colorPicker, color)
    if (update) {
      nodes.select.value = 'choose'
      RightCommon.changeStyle({ [nodes.property]: color })
    }
  },

  buildColorPicker (container) {
    const template = HelperDOM.getTemplate('template-color-picker')
    container.appendChild(template)
    return template
  },

  injectColorInPicker (colorPicker, color) {
    ColorPickerSwatch.injectSwatches(colorPicker)
    if (color) {
      const rgb = HelperColor.extractRgb(color)
      ColorPickerSolidColor.injectColor(colorPicker, rgb)
    }
  },

  hideColorPicker (nodes) {
    nodes.buttonMain.classList.remove('active')
    HelperDOM.deleteChildren(nodes.pickerContainer)
  },

  setSelectColor (container) {
    const nodes = this.getNodes(container)
    if (nodes.select.value === 'choose') {
      this.showColorPicker(nodes, true)
    } else {
      RightCommon.changeStyle({ [nodes.property]: nodes.select.value })
      this.hideColorPicker(nodes)
    }
  },

  changeColor (container, options = {}) {
    const nodes = this.getNodes(container)
    const color = ColorPicker.getColorPickerValue(nodes.picker)
    nodes.button.style.backgroundColor = color
    ColorPickerCommon.setColor({ [nodes.property]: color }, options)
  }
}
