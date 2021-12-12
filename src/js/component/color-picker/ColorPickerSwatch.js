import ColorPickerInput from './ColorPickerInput.js'
import HelperDOM from '../../helper/HelperDOM.js'
import StateCommand from '../../state/StateCommand.js'
import HelperEvent from '../../helper/HelperEvent.js'
import HelperColor from '../../helper/HelperColor.js'
import StyleSheetCommon from '../../state/stylesheet/StyleSheetCommon.js'

export default {
  _timer: null,

  getEvents () {
    return {
      click: ['clickSaveSwatchEvent', 'clickLoadSwatchEvent'],
      dblclick: ['dblclickDeleteSwatchEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  async clickSaveSwatchEvent (event) {
    if (event.target.closest('.save-swatch-button')) {
      await this.saveSwatch(event.target.closest('.save-swatch-button'))
    }
  },

  clickLoadSwatchEvent (event) {
    // use a timer and the event.detail check, to prevent the click events firing twice for double click
    if (event.target.closest('.swatch-color') && event.detail === 1) {
      this._timer = setTimeout(() => {
        this.loadSwatch(event.target.closest('.swatch-color'))
      }, 200)
    }
  },

  async dblclickDeleteSwatchEvent (event) {
    if (event.target.closest('.swatch-color')) {
      this.clearTimeout()
      await this.deleteSwatch(event.target.closest('.swatch-color'))
    }
  },

  clearTimeout () {
    // it's important to clear our state at the end, otherwise we have leftovers spilling
    clearTimeout(this._timer)
    this._timer = null
  },

  async saveSwatch (button) {
    const container = button.closest('.color-picker')
    const color = ColorPickerInput.getRgbColor(container)
    const name = this.getColorName(container)
    await this.saveAddSwatchColor(name, color)
    this.addSwatchColor(button, name, color)
  },

  getColorName (container) {
    const hex = ColorPickerInput.getHexInput(container).value
    const alpha = HelperColor.getHexAlpha(ColorPickerInput.getAlpha(container))
    return '--color-' + (hex + alpha).toLowerCase()
  },

  async saveAddSwatchColor (name, color) {
    const command = {
      do: {
        command: 'addColor',
        name: name,
        value: color
      },
      undo: {
        command: 'removeColor',
        name: name
      }
    }
    StateCommand.stackCommand(command)
    await StateCommand.executeCommand(command.do)
  },

  addSwatchColor (button, name, color) {
    const swatch = this.prepareSwatchElement(name, color)
    button.insertAdjacentElement('afterend', swatch)
  },

  prepareSwatchElement (name, color) {
    const container = HelperDOM.getTemplate('template-color-picker-swatch')
    const swatch = container.children[0]
    swatch.dataset.name = name
    swatch.dataset.value = color
    swatch.style.backgroundColor = color
    return container
  },

  loadSwatch (swatch) {
    const container = swatch.closest('.color-picker')
    const inputs = container.getElementsByClassName('color-rgb-input')
    const rgb = HelperColor.extractRgb(swatch.dataset.value)
    ColorPickerInput.setRgbInputs(inputs, rgb)
    this.setAlpha(container, rgb[3] || 1)
    ColorPickerInput.inputRgbInput(inputs[0])
  },

  setAlpha (container, alpha) {
    const input = container.getElementsByClassName('color-alpha')[0]
    input.value = alpha * 100
    const palette = container.getElementsByClassName('fill-color-alpha')[0]
    palette.dataset.alpha = alpha
  },

  async deleteSwatch (swatch) {
    await this.saveRemoveSwatchColor(swatch.dataset.name, swatch.dataset.value)
    this.removeSwatchColor(swatch)
  },

  async saveRemoveSwatchColor (name, value) {
    const command = {
      do: {
        command: 'removeColor',
        name
      },
      undo: {
        command: 'addColor',
        name,
        value
      }
    }
    StateCommand.stackCommand(command)
    await StateCommand.executeCommand(command.do)
  },

  removeSwatchColor (swatch) {
    swatch.parentNode.remove()
  },

  injectSwatches (container) {
    const button = container.getElementsByClassName('save-swatch-button')[0]
    if (button) {
      const swatches = this.getSwatches()
      for (const [name, color] of Object.entries(swatches)) {
        this.addSwatchColor(button, name, color.trim())
      }
    }
  },

  getSwatches () {
    const colors = {}
    const style = StyleSheetCommon.getSelectorStyle(':root', false)
    if (!style) return colors
    for (const prop of style) {
      if (prop.name && prop.name.startsWith('--color-')) colors[prop.name] = prop.value
    }
    return colors
  }
}
