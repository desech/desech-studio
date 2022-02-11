import RightCommon from '../../RightCommon.js'
import InputUnitField from '../../../../component/InputUnitField.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import RightVariableInject from '../variable/RightVariableInject.js'
import RightVariableCommon from '../variable/RightVariableCommon.js'

export default {
  getEvents () {
    return {
      click: ['clickConstrainEvent'],
      change: ['changeFieldEvent']
    }
  },

  clickConstrainEvent (event) {
    if (event.target.closest('.button-link')) {
      this.switchConstrain(event.target.closest('.button-link'))
    }
  },

  async changeFieldEvent (event) {
    if (event.target.classList.contains('margpad-field')) {
      await this.changeField(event.target)
    }
  },

  switchConstrain (button) {
    const type = button.dataset.type
    const fields = button.closest('form').getElementsByClassName(`${type}-field`)
    if (button.classList.contains('selected')) {
      button.classList.remove('selected')
      this.toggleDisabled(fields, false)
    } else {
      button.classList.add('selected')
      this.toggleDisabled(fields, true)
    }
  },

  toggleDisabled (fields, disable) {
    for (const field of fields) {
      if (field.name.indexOf('-top') > 0) continue
      field.toggleAttribute('disabled', disable)
      // also disable the unit measure dropdown
      field.nextElementSibling.toggleAttribute('disabled', disable)
    }
  },

  async changeField (input) {
    const type = (input.name.startsWith('margin')) ? 'margin' : 'padding'
    const value = InputUnitField.getValue(input)
    const fields = input.closest('form').elements
    if (fields[`${type}-constrain`].classList.contains('selected')) {
      await this.changeStyleAll(type, value)
      this.changeAllFields(fields, type, value)
    } else {
      await RightCommon.changeStyle({ [input.name]: value })
      RightVariableInject.updateFieldVariables(input)
    }
  },

  changeAllFields (fields, type, value) {
    const style = StateSelectedElement.getComputedStyle()
    for (const dir of ['top', 'left', 'right', 'bottom']) {
      const name = `${type}-${dir}`
      InputUnitField.setValue(fields[name], value, style[name])
      RightVariableInject.updateFieldVariables(fields[name])
    }
  },

  async changeStyleAll (type, value) {
    await RightCommon.changeStyle({
      [`${type}-top`]: value,
      [`${type}-left`]: value,
      [`${type}-right`]: value,
      [`${type}-bottom`]: value
    })
  },

  injectFields (form, data) {
    for (const field of form.elements) {
      if (!field.classList.contains('margpad-field')) continue
      InputUnitField.setValue(field, data.style[field.name], data.computedStyle[field.name])
    }
  },

  injectConstraints (form, style) {
    for (const type of ['margin', 'padding']) {
      if (!RightVariableCommon.isMarginPaddingSame(type, style)) {
        this.switchConstrain(form.elements[`${type}-constrain`])
      }
    }
  }
}
