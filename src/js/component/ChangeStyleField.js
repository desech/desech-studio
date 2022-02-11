import InputUnitField from './InputUnitField.js'
import CheckButtonField from './CheckButtonField.js'
import RightCommon from '../main/right/RightCommon.js'
import RightVariableInject from '../main/right/section/variable/RightVariableInject.js'
import HelperDOM from '../helper/HelperDOM.js'

export default {
  getEvents () {
    return {
      click: ['clickButtonRightEvent'],
      change: ['changeStyleInputEvent']
    }
  },

  async changeStyleInputEvent (event) {
    if (event.target.classList.contains('change-style') &&
      ['INPUT', 'SELECT'].includes(event.target.tagName)) {
      await this.changeStyle(event.target)
    }
  },

  async clickButtonRightEvent (event) {
    if (event.target.closest('button.change-style')) {
      await this.changeStyle(event.target.closest('button'))
    }
  },

  async changeStyle (field) {
    await RightCommon.changeStyle({ [field.name]: this.getValue(field) })
    RightVariableInject.updateUnitMeasureVariables(field)
  },

  getValue (field) {
    if (!field) return null
    if (field.classList.contains('input-unit-value')) {
      return InputUnitField.getValue(field)
    } else if (field.tagName === 'INPUT' || field.tagName === 'SELECT') {
      return field.value
    } else if (field.tagName === 'BUTTON') {
      return CheckButtonField.getValue(field)
    }
  },

  injectFields (form, data) {
    for (const field of form.elements) {
      if (field.classList.contains('change-style')) {
        this.setValue(field, data.style[field.name], data.computedStyle[field.name])
      }
    }
  },

  setValue (field, css, style) {
    if (field.classList.contains('input-unit-value')) {
      InputUnitField.setValue(field, css, style)
    } else if ((field.tagName === 'SELECT' || field.tagName === 'INPUT') &&
      !field.classList.contains('input-unit-measure')) {
      field.value = css || ''
    } else if (field.tagName === 'BUTTON') {
      CheckButtonField.setValue(field, css)
    }
  }
}
