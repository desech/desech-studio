import CheckButtonField from '../../../../component/CheckButtonField.js'
import StateStyleSheet from '../../../../state/StateStyleSheet.js'
import ColorPickerButton from '../../../../component/color-picker/ColorPickerButton.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import RightCommon from '../../RightCommon.js'
import HelperDOM from '../../../../helper/HelperDOM.js'

export default {
  getEvents () {
    return {
      click: ['clickSetDecorationEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  async clickSetDecorationEvent (event) {
    if (event.target.closest('button.text-decoration')) {
      await this.setDecoration(event.target.closest('button'))
    }
  },

  async setDecoration (button) {
    this.validateState(button, button.parentNode.elements)
    const value = this.getButtonsValue(button.parentNode)
    await RightCommon.changeStyle({ 'text-decoration-line': value })
  },

  validateState (button, fields) {
    // `none` and the other buttons can't be selected at the same time
    if (!button.classList.contains('selected')) return
    const none = fields[0]
    const others = [fields[1], fields[2], fields[3]]
    if (button.value === 'none') {
      for (const button of others) {
        if (button.classList.contains('selected')) button.classList.remove('selected')
      }
    } else {
      if (none.classList.contains('selected')) none.classList.remove('selected')
    }
  },

  getButtonsValue (container) {
    const values = []
    for (const button of container.getElementsByTagName('button')) {
      values.push(CheckButtonField.getValue(button))
    }
    return values.join(' ')
  },

  injectTextDecorationLine (container) {
    this.injectDecorationLine(container)
    this.injectDecorationColor(container)
  },

  injectDecorationLine (container) {
    const values = this.getStyleValues()
    if (!values) return
    for (const button of container.getElementsByClassName('text-decoration')) {
      if (values.includes(button.value)) button.classList.add('selected')
    }
  },

  getStyleValues () {
    const value = StateStyleSheet.getPropertyValue('text-decoration-line')
    return value ? value.split(' ') : null
  },

  injectDecorationColor (container) {
    const query = '.color-button-wrapper[data-property="text-decoration-color"]'
    const colorContainer = container.querySelector(query)
    ColorPickerButton.injectPropertyColor(colorContainer)
  }
}
