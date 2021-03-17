import ExtendJS from '../../../../helper/ExtendJS.js'
import CanvasOverlayCommon from '../CanvasOverlayCommon.js'
import StateTempStyle from '../../../../state/StateTempStyle.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'

export default {
  resize (button, counter, direction, changeX, changeY) {
    const value = this.getValue(direction, changeX, changeY)
    if (value < 0) return
    this.setValue(button, counter, direction, value)
    return value
  },

  getValue (direction, changeX, changeY) {
    const change = (direction === 'left' || direction === 'right') ? changeX : changeY
    let value = parseInt(StateSelectedElement.getComputed('margin-' + direction) || 0)
    value = value < 0 ? 0 : value // don't allow negative margin/padding
    return value + change
  },

  setValue (button, counter, direction, value) {
    const visualValue = this.calculate(CanvasOverlayCommon.getVisualValue(value))
    this['set' + ExtendJS.capitalize(direction)](button, visualValue)
    StateTempStyle.setStyleValue('margin-' + direction, value + 'px')
    CanvasOverlayCommon.updateResizeCounter(counter, value)
  },

  calculate (value) {
    return {
      buttonMargin: -(value + 8) + 'px',
      containerMargin: -value + 'px',
      containerBorder: value + 'px'
    }
  },

  setLeft (button, values) {
    button.style.left = values.buttonMargin
    button.parentNode.style.marginLeft = values.containerMargin
    button.parentNode.style.borderLeftWidth = values.containerBorder
  },

  setRight (button, values) {
    button.style.right = values.buttonMargin
    button.parentNode.style.borderRightWidth = values.containerBorder
  },

  setTop (button, values) {
    button.style.top = values.buttonMargin
    button.parentNode.style.marginTop = values.containerMargin
    button.parentNode.style.borderTopWidth = values.containerBorder
  },

  setBottom (button, values) {
    button.style.bottom = values.buttonMargin
    button.parentNode.style.borderBottomWidth = values.containerBorder
  }
}
