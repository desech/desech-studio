import InputUnitField from '../../../../component/InputUnitField.js'
import TabComponent from '../../../../component/TabComponent.js'
import RightCommon from '../../RightCommon.js'
import RightVariableInject from '../variable/RightVariableInject.js'

export default {
  getEvents () {
    return {
      click: ['clickSwitchRadiusEvent'],
      change: ['changeStyleAllEvent', 'changeStyleEachEvent']
    }
  },

  clickSwitchRadiusEvent (event) {
    if (event.target.closest('.switch-radius')) {
      this.switchRadius(event.target.closest('.switch-radius'))
    }
  },

  async changeStyleAllEvent (event) {
    if (event.target.classList.contains('border-radius')) {
      await this.changeStyleAll(event.target)
    }
  },

  async changeStyleEachEvent (event) {
    if (event.target.classList.contains('border-radius-each')) {
      await this.changeStyleEach(event.target)
    }
  },

  switchRadius (button) {
    const data = RightCommon.getSectionData()
    this.injectInputs(button.closest('form'), button.value, data)
  },

  async changeStyleAll (input) {
    const container = this.getInputAllContainer(input)
    const value = this.getRadiusValue(container)
    await RightCommon.changeStyle({
      'border-top-left-radius': value,
      'border-top-right-radius': value,
      'border-bottom-left-radius': value,
      'border-bottom-right-radius': value
    })
    RightVariableInject.updateFieldVariables(input)
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

  async changeStyleEach (input) {
    const container = this.getInputEachContainer(input)
    const name = this.getInputName(input)
    await RightCommon.changeStyle({
      [name]: this.getRadiusValue(container)
    })
    RightVariableInject.updateFieldVariables(input)
  },

  getInputEachContainer (input) {
    return input.closest('.grid')
  },

  getInputName (input) {
    return input.name.replace('-vertical', '')
  },

  injectRadius (container, data) {
    const type = this.getRadiusType(data)
    this.injectSwitchButton(container, type)
    this.injectInputs(container, type, data)
  },

  getRadiusType (data) {
    const values = this.getRadiusTypeValues(data)
    for (const val of values) {
      if (val !== values[0]) return 'each'
    }
    return 'all'
  },

  getRadiusTypeValues (data) {
    return [
      data.style['border-top-left-radius'],
      data.style['border-top-right-radius'],
      data.style['border-bottom-left-radius'],
      data.style['border-bottom-right-radius']
    ]
  },

  injectSwitchButton (container, type) {
    const button = container.querySelector(`.switch-radius.tab-button[value="${type}"]`)
    TabComponent.selectTab(button)
  },

  injectInputs (container, type, data) {
    for (const field of container.elements) {
      if ((type === 'all' && field.classList.contains('border-radius')) ||
        (type !== 'all' && field.classList.contains('border-radius-each'))) {
        const name = field.classList.contains('border-radius')
          ? 'border-top-left-radius'
          : this.getInputName(field)
        if (!data.style[name]) continue
        const cssValues = data.style[name].split(' ')
        const styleValues = data.computedStyle[name].split(' ')
        this.injectInput(field, cssValues, styleValues)
      }
    }
  },

  injectInput (field, cssValues, styleValues) {
    const i = field.name.includes('-vertical') ? 1 : 0
    InputUnitField.setValue(field, cssValues[i], styleValues[i])
  }
}
