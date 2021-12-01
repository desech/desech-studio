import HelperEvent from '../../../../helper/HelperEvent.js'
import RightCommon from '../../RightCommon.js'
import InputUnitField from '../../../../component/InputUnitField.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import StyleSheetSelector from '../../../../state/stylesheet/StyleSheetSelector.js'
import StateStyleSheet from '../../../../state/StateStyleSheet.js'

export default {
  getEvents () {
    return {
      click: ['clickConstrainEvent'],
      change: ['changeFieldEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
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
      HelperDOM.toggleAttribute(field, disable, 'disabled')
      // also disable the unit measure dropdown
      HelperDOM.toggleAttribute(field.nextElementSibling, disable, 'disabled')
    }
  },

  async changeField (input) {
    const type = (input.name.startsWith('margin')) ? 'margin' : 'padding'
    const value = InputUnitField.getValue(input)
    const fields = input.closest('form').elements
    if (fields[`${type}-constrain`].classList.contains('selected')) {
      await this.changeStyleAll(type, value)
      this.changeOtherFields(fields, type, value)
    } else {
      await RightCommon.changeStyle({ [input.name]: value })
    }
  },

  changeOtherFields (fields, type, value) {
    const style = StateSelectedElement.getComputedStyle()
    for (const dir of ['left', 'right', 'bottom']) {
      const name = `${type}-${dir}`
      InputUnitField.setValue(fields[name], value, style[name])
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

  injectFields (container, data) {
    for (const field of container.elements) {
      if (!field.classList.contains('margpad-field')) continue
      InputUnitField.setValue(field, data.style[field.name], data.computedStyle[field.name])
    }
  },

  injectConstraints (form) {
    for (const type of ['margin', 'padding']) {
      if (!this.isContrained(form.elements, type)) {
        this.switchConstrain(form.elements[`${type}-constrain`])
      }
    }
  },

  isContrained (fields, type) {
    const value = InputUnitField.getValue(fields[`${type}-top`])
    for (const dir of ['bottom', 'left', 'right']) {
      if (value !== InputUnitField.getValue(fields[`${type}-${dir}`])) {
        return false
      }
    }
    return true
  }
}
