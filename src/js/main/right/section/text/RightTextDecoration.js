import CheckButtonField from '../../../../component/CheckButtonField.js'
import ColorPickerButton from '../../../../component/color-picker/ColorPickerButton.js'
import RightCommon from '../../RightCommon.js'
import RightVariableInject from '../variable/RightVariableInject.js'
import RightVariableCommon from '../variable/RightVariableCommon.js'

export default {
  getEvents () {
    return {
      click: ['clickSetDecorationButtonEvent'],
      change: ['changeSetDecorationGeneralEvent']
    }
  },

  // same logic in RightVariableForm
  async clickSetDecorationButtonEvent (event) {
    if (event.target.closest('button.text-decoration') &&
      !event.target.closest('#variable-section')) {
      await this.setDecorationButton(event.target.closest('form').elements)
    }
  },

  async changeSetDecorationGeneralEvent (event) {
    if (event.target.closest('select.text-decoration-general') &&
      !event.target.closest('#variable-section') &&
      !RightVariableCommon.isExecuteAction(event.target.value)) {
      await this.setDecorationGeneral(event.target.closest('form'))
    }
  },

  async setDecorationButton (fields) {
    fields.decorationSelect.value = ''
    const value = this.getButtonsValue(fields.decorationButton)
    await RightCommon.changeStyle({ 'text-decoration-line': value })
    fields.decorationSelect.dataset.value = value
    RightVariableInject.updateFieldVariables(fields.decorationSelect)
  },

  getButtonsValue (buttons) {
    const values = []
    for (const button of buttons) {
      values.push(CheckButtonField.getValue(button))
    }
    return values.join(' ').trim()
  },

  async setDecorationGeneral (form) {
    CheckButtonField.deselectButtons(form)
    const value = form.elements.decorationSelect.value
    await RightCommon.changeStyle({ 'text-decoration-line': value })
    form.elements.decorationSelect.dataset.value = value
    RightVariableInject.updateFieldVariables(form.elements.decorationSelect)
  },

  injectTextDecorationLine (form, style) {
    this.injectDecorationLine(form.elements, style['text-decoration-line'])
    this.injectDecorationColor(form, style)
  },

  injectDecorationLine (fields, value) {
    if (!value) return
    fields.decorationSelect.dataset.value = value
    if (RightCommon.isGeneralValue(value) || value.startsWith('var(--')) {
      fields.decorationSelect.value = value
    } else {
      this.injectButtons(fields.decorationButton, value)
    }
  },

  injectButtons (buttons, value) {
    for (const button of buttons) {
      if (value.includes(button.value)) {
        button.classList.add('selected')
      }
    }
  },

  injectDecorationColor (container, style) {
    const query = '.color-button-wrapper[data-property="text-decoration-color"]'
    const colorContainer = container.querySelector(query)
    ColorPickerButton.injectPropertyColor(colorContainer, style)
  }
}
