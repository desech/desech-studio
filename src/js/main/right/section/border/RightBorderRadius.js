import StateStyleSheet from '../../../../state/StateStyleSheet.js'
import InputUnitField from '../../../../component/InputUnitField.js'
import TabComponent from '../../../../component/TabComponent.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import RightCommon from '../../RightCommon.js'
import StyleSheetSelector from '../../../../state/stylesheet/StyleSheetSelector.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'

export default {
  getEvents () {
    return {
      click: ['clickSwitchRadiusEvent'],
      change: ['changeStyleAllEvent', 'changeStyleEachEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickSwitchRadiusEvent (event) {
    if (event.target.closest('.switch-radius')) {
      this.switchRadius(event.target.closest('.switch-radius'))
    }
  },

  changeStyleAllEvent (event) {
    if (event.target.classList.contains('border-radius')) {
      this.changeStyleAll(event.target)
    }
  },

  changeStyleEachEvent (event) {
    if (event.target.classList.contains('border-radius-each')) {
      this.changeStyleEach(event.target)
    }
  },

  switchRadius (button) {
    const style = StateSelectedElement.getStyle()
    this.injectInputs(button.closest('form'), style, button.value)
  },

  changeStyleAll (input) {
    const container = this.getInputAllContainer(input)
    const value = this.getRadiusValue(container)
    RightCommon.changeStyle({
      'border-top-left-radius': value,
      'border-top-right-radius': value,
      'border-bottom-left-radius': value,
      'border-bottom-right-radius': value
    })
  },

  getInputAllContainer (input) {
    return input.closest('.border-radius-all-container')
  },

  getRadiusValue (container) {
    const inputs = this.getRadiusInputs(container)
    return this.getRadiusProperty(inputs)
  },

  getRadiusInputs (container) {
    return {
      horizontal: container.getElementsByClassName('input-unit-value')[0],
      vertical: container.getElementsByClassName('input-unit-value')[1]
    }
  },

  getRadiusProperty (inputs) {
    let value = ''
    if (inputs.horizontal.value) {
      value = InputUnitField.getValue(inputs.horizontal)
    }
    if (inputs.vertical.value) {
      value += value ? ' ' : '0px '
      value += InputUnitField.getValue(inputs.vertical)
    }
    return value
  },

  changeStyleEach (input) {
    const container = this.getInputEachContainer(input)
    const name = this.getInputName(input)
    RightCommon.changeStyle({
      [name]: this.getRadiusValue(container)
    })
  },

  getInputEachContainer (input) {
    return input.closest('.grid')
  },

  getInputName (input) {
    return input.name.replace('-vertical', '')
  },

  injectRadius (container, style) {
    const type = this.getRadiusType()
    this.injectSwitchButton(container, type)
    this.injectInputs(container, style, type)
  },

  getRadiusType () {
    const values = this.getRadiusTypeValues()
    for (const val of values) {
      if (val !== values[0]) {
        return 'each'
      }
    }
    return 'all'
  },

  getRadiusTypeValues () {
    const selector = StyleSheetSelector.getCurrentSelector()
    return [
      StateStyleSheet.getPropertyValue('border-top-left-radius', selector),
      StateStyleSheet.getPropertyValue('border-top-right-radius', selector),
      StateStyleSheet.getPropertyValue('border-bottom-left-radius', selector),
      StateStyleSheet.getPropertyValue('border-bottom-right-radius', selector)
    ]
  },

  injectSwitchButton (container, type) {
    const button = container.querySelector(`.switch-radius.tab-button[value="${type}"]`)
    TabComponent.selectTab(button)
  },

  injectInputs (container, style, type) {
    const selector = StyleSheetSelector.getCurrentSelector()
    for (const field of container.elements) {
      if ((type === 'all' && field.classList.contains('border-radius')) || (type !== 'all' && field.classList.contains('border-radius-each'))) {
        const name = field.classList.contains('border-radius') ? 'border-top-left-radius' : this.getInputName(field)
        const cssValues = StateStyleSheet.getPropertyValue(name, selector).split(' ')
        const styleValues = style[name].split(' ')
        this.injectInput(field, cssValues, styleValues)
      }
    }
  },

  injectInput (field, cssValues, styleValues) {
    const i = field.name.includes('-vertical') ? 1 : 0
    InputUnitField.setValue(field, cssValues[i], styleValues[i])
  }
}
