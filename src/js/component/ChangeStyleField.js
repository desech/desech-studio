import StateStyleSheet from '../state/StateStyleSheet.js'
import InputUnitField from './InputUnitField.js'
import CheckButtonField from './CheckButtonField.js'
import HelperEvent from '../helper/HelperEvent.js'
import RightCommon from '../main/right/RightCommon.js'

export default {
  getEvents () {
    return {
      click: ['clickButtonRightEvent'],
      change: ['changeStyleInputEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  changeStyleInputEvent (event) {
    if (event.target.classList.contains('change-style') &&
      ['INPUT', 'SELECT'].includes(event.target.tagName)) {
      this.changeStyle(event.target)
    }
  },

  clickButtonRightEvent (event) {
    if (event.target.closest('button.change-style')) {
      this.changeStyle(event.target.closest('button'))
    }
  },

  changeStyle (field) {
    RightCommon.changeStyle({
      [field.name]: this.getValue(field)
    })
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

  injectFields (template, style) {
    const css = StateStyleSheet.getCurrentStyleObject()
    for (const field of template.elements) {
      if (field.classList.contains('change-style')) {
        this.setValue(field, css[field.name], style[field.name])
      }
    }
  },

  setValue (field, css, style) {
    if (field.classList.contains('input-unit-value')) {
      InputUnitField.setValue(field, css, style)
    } else if ((field.tagName === 'SELECT' || field.tagName === 'INPUT') && !field.classList.contains('input-unit-measure')) {
      field.value = css || ''
    } else if (field.tagName === 'BUTTON') {
      CheckButtonField.setValue(field, css)
    }
  }
}
