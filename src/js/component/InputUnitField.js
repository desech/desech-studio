import ExtendJS from '../helper/ExtendJS.js'
import RightVariableCommon from '../main/right/section/variable/RightVariableCommon.js'

export default {
  getEvents () {
    return {
      change: ['changeInputValueEvent', 'changeSelectUnitEvent'],
      keydown: ['keydownOperateNumberEvent']
    }
  },

  changeInputValueEvent (event) {
    if (event.target.classList.contains('input-unit-value')) {
      console.log('changeInputValueEvent exec')
      this.changeInputValue(event.target)
    }
  },

  changeSelectUnitEvent (event) {
    if (event.target.classList.contains('input-unit-measure') &&
      !RightVariableCommon.isExecuteAction(event.target.value)) {
      console.log('changeSelectUnitEvent exec', event.target.value)
      this.selectUnit(event.target)
    }
  },

  keydownOperateNumberEvent (event) {
    if (event.key && event.target.classList.contains('input-unit-value')) {
      this.operateNumber(event.key, event.target)
    }
  },

  changeInputValue (input) {
    this.setValueField(input, input.value)
  },

  setValueField (field, value) {
    if (ExtendJS.startsNumeric(value)) {
      this.setNumericValue(field, value)
    } else if (value) {
      this.setCustomValue(field, value)
    } else {
      this.setDefaultUnit(field.nextElementSibling)
    }
  },

  setNumericValue (field, value) {
    const numeric = this.getNumericValue(value)
    if (Array.isArray(numeric)) {
      field.value = numeric[0]
      field.nextElementSibling.value = numeric[1]
    } else {
      field.value = numeric
    }
  },

  getNumericValue (value) {
    const regexData = /(?<value>^-?[0-9]([0-9.,]+)?)(?<unit>[a-z%]+)/gi.exec(value)
    if (regexData) {
      return [regexData.groups.value, regexData.groups.unit]
    } else {
      return value
    }
  },

  setCustomValue (field, value) {
    field.value = value
    field.nextElementSibling.value = '-'
  },

  setDefaultUnit (select) {
    select.value = select.options[0].value
  },

  selectUnit (select) {
    const input = select.previousElementSibling
    if (!select.selectedOptions[0].dataset.numeric) {
      this.selectUnitCustom(input, select)
    }
    this.triggerChange(input)
  },

  selectUnitCustom (input, select) {
    const value = select.value
    select.value = '-'
    this.setInputValue(input, value)
  },

  setInputValue (input, value) {
    input.value = value
  },

  triggerChange (input) {
    input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))
  },

  operateNumber (key, input) {
    if (key === 'ArrowUp') {
      this.changeNumber(input, '+')
    } else if (key === 'ArrowDown') {
      this.changeNumber(input, '-')
    }
  },

  changeNumber (input, operation) {
    if (this.canMutateNumber(input)) {
      const number = this.getNextNumber(input.value, operation)
      this.setInputValue(input, number)
      // the value will actually be applied on Enter or blur
    }
  },

  canMutateNumber (input) {
    const select = input.nextElementSibling
    return this.isValueNumeric(input.value) && this.isSelectNumeric(select)
  },

  getNextNumber (value, operation) {
    let number, change, next
    if (value.includes('.')) {
      number = parseFloat(value)
      change = operation === '+' ? 0.1 : -0.1
      next = (number + change).toFixed(1)
    } else {
      number = parseInt(value)
      change = operation === '+' ? 1 : -1
      next = number + change
    }
    return next
  },

  isValueNumeric (value) {
    return value && ExtendJS.isNumeric(value)
  },

  isSelectNumeric (select) {
    return select.selectedOptions[0].dataset.numeric
  },

  getValue (input) {
    if (input.value) {
      const select = input.nextElementSibling
      return input.value + (select.value === '-' ? '' : select.value)
    } else {
      return ''
    }
  },

  setValue (field, value, style = null) {
    if (!field) return
    if (value) {
      this.setValueField(field, value)
    } else if (style !== null) {
      this.setUnitValue(field.nextElementSibling, style)
      field.value = ''
      this.injectInputPlaceholder(field, style)
    }
  },

  setUnitValue (select, value) {
    if (ExtendJS.startsNumeric(value)) {
      const numeric = this.getNumericValue(value)
      if (Array.isArray(numeric)) select.value = numeric[1]
    } else if (value) {
      this.setDefaultUnit(select)
    }
  },

  injectInputPlaceholder (input, style) {
    const value = ExtendJS.startsNumeric(style) ? ExtendJS.roundToTwo(style) : style
    if (value) input.placeholder = value
  }
}
