import ColorPickerInput from './ColorPickerInput.js'
import HelperColor from '../../helper/HelperColor.js'
import RightVariableMain from '../../main/right/section/variable/RightVariableMain.js'
import StateSelectedVariable from '../../state/StateSelectedVariable.js'
import LeftVariableCommon from '../../main/left/variable/LeftVariableCommon.js'
import HelperDOM from '../../helper/HelperDOM.js'

export default {
  _timer: null,

  getEvents () {
    return {
      click: ['clickSaveColorEvent', 'clickLoadColorEvent'],
      dblclick: ['dblclickGotoUpdateColorEvent']
    }
  },

  clickSaveColorEvent (event) {
    if (event.target.closest('.save-swatch-button')) {
      this.saveColor(event.target.closest('.color-button-wrapper'))
    }
  },

  clickLoadColorEvent (event) {
    // use a timer and the event.detail check, to prevent the click events firing twice
    // for double click
    if (event.target.closest('.swatch-color') && event.detail === 1) {
      this._timer = setTimeout(() => {
        this.loadColor(event.target.closest('.swatch-color'))
      }, 200)
    }
  },

  dblclickGotoUpdateColorEvent (event) {
    if (event.target.closest('.swatch-color')) {
      this.clearTimeout()
      this.gotoUpdateVariable(event.target.closest('.swatch-color'))
    }
  },

  clearTimeout () {
    // it's important to clear our state at the end, otherwise we have leftovers spilling
    clearTimeout(this._timer)
    this._timer = null
  },

  saveColor (container) {
    const propertyName = container.dataset.property
    RightVariableMain.showCreateDialog(propertyName)
  },

  loadColor (swatch) {
    const container = swatch.closest('.color-picker')
    const inputs = container.getElementsByClassName('color-rgb-input')
    const rgb = HelperColor.extractRgb(swatch.dataset.value)
    ColorPickerInput.setRgbInputs(inputs, rgb)
    this.setAlpha(container, rgb[3] || 1)
    // this will trigger a color change event
    const options = { variable: swatch.dataset.ref }
    ColorPickerInput.updateRgbInput(inputs[0], true, options)
  },

  setAlpha (container, alpha) {
    const input = container.getElementsByClassName('color-alpha')[0]
    input.value = alpha * 100
    const palette = container.getElementsByClassName('fill-color-alpha')[0]
    palette.dataset.alpha = alpha
  },

  gotoUpdateVariable (node) {
    StateSelectedVariable.selectVariable(node.dataset.ref)
  },

  injectColors (container) {
    const button = container.getElementsByClassName('save-swatch-button')[0]
    if (!button) return
    for (const variable of LeftVariableCommon.getColors()) {
      this.addSwatchColor(button, variable)
    }
  },

  addSwatchColor (button, variable) {
    const swatch = this.prepareSwatchElement(variable)
    button.insertAdjacentElement('afterend', swatch)
  },

  prepareSwatchElement (variable) {
    const container = HelperDOM.getTemplate('template-color-picker-swatch')
    const swatch = container.children[0]
    swatch.dataset.ref = variable.ref
    container.dataset.tooltip = variable.name + ' - ' + container.dataset.tooltip
    swatch.dataset.value = swatch.style.backgroundColor = variable.value
    return container
  }
}
