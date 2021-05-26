import ExtendJS from '../helper/ExtendJS.js'
import HelperEvent from '../helper/HelperEvent.js'

export default {
  getEvents () {
    return {
      change: ['changeSelectUnitEvent'],
      keydown: ['keydownOperateNumberEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  changeSelectUnitEvent (event) {
    if (event.target.classList.contains('input-unit-measure')) {
      this.selectUnit(event.target)
    }
  },

  keydownOperateNumberEvent (event) {
    if (event.key && event.target.classList.contains('input-unit-value')) {
      this.operateNumber(event.key, event.target)
    }
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
      this.setUnitValue(field, style)
      field.value = ''
      this.injectInputPlaceholder(field, style)
    }
  },

  setUnitValue (field, value) {
    if (ExtendJS.startsNumeric(value)) {
      const numeric = this.getNumericValue(value)
      if (Array.isArray(numeric)) field.nextElementSibling.value = numeric[1]
    } else if (value) {
      field.nextElementSibling.value = '-'
    }
  },

  injectInputPlaceholder (input, style) {
    const value = ExtendJS.startsNumeric(style) ? ExtendJS.roundToTwo(style) : style
    if (value) input.placeholder = value
  },

  setValueField (field, value) {
    if (ExtendJS.startsNumeric(value)) {
      this.setNumericValue(field, value)
    } else {
      this.setCustomValue(field, value)
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
    const regexData = this.splitNumericValue(value)
    if (regexData) {
      return [regexData.groups.value, regexData.groups.unit]
    } else {
      return value
    }
  },

  splitNumericValue (value) {
    return /(?<value>-?[0-9.,]+)(?<unit>[a-z%]+)/gi.exec(value)
  },

  setCustomValue (field, value) {
    field.value = value
    field.nextElementSibling.value = '-'
  }
}
