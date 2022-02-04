import CheckButtonField from '../../../../component/CheckButtonField.js'
import ColorPickerButton from '../../../../component/color-picker/ColorPickerButton.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import RightCommon from '../../RightCommon.js'

export default {
  getEvents () {
    return {
      click: ['clickSetDecorationButtonEvent'],
      change: ['changeSetDecorationGeneralEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  async clickSetDecorationButtonEvent (event) {
    if (event.target.closest('button.text-decoration')) {
      await this.setDecorationButton(event.target.closest('form').elements)
    }
  },

  async changeSetDecorationGeneralEvent (event) {
    if (event.target.closest('select.text-decoration-general')) {
      await this.setDecorationGeneral(event.target.closest('form'))
    }
  },

  async setDecorationButton (fields) {
    fields.general.value = ''
    const value = this.getButtonsValue(fields)
    await RightCommon.changeStyle({ 'text-decoration-line': value })
  },

  getButtonsValue (fields) {
    const values = []
    for (const button of fields.button) {
      values.push(CheckButtonField.getValue(button))
    }
    return values.join(' ')
  },

  async setDecorationGeneral (form) {
    CheckButtonField.deselectButtons(form)
    const value = form.elements.general.value
    await RightCommon.changeStyle({ 'text-decoration-line': value })
  },

  injectTextDecorationLine (container, style) {
    this.injectDecorationLine(container, style)
    this.injectDecorationColor(container, style)
  },

  injectDecorationLine (container, style) {
    const value = style['text-decoration-line']
    if (!value) return
    const fields = container.getElementsByClassName('text-decoration-form')[0].elements
    if (RightCommon.isGeneralValue(value)) {
      fields.general.value = value
    } else {
      this.injectButtons(fields.button, value)
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
