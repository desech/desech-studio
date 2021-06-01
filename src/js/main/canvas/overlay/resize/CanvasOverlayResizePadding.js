import ExtendJS from '../../../../helper/ExtendJS.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import CanvasOverlayCommon from '../CanvasOverlayCommon.js'
import StateTempStyle from '../../../../state/StateTempStyle.js'

export default {
  resize (button, counter, direction, changeX, changeY) {
    const value = this.getValue(direction, changeX, changeY)
    if (value < 0) return
    this.setValue(button, counter, direction, value)
    return value
  },

  getValue (direction, changeX, changeY) {
    const change = (direction === 'left' || direction === 'right') ? changeX : changeY
    let value = parseInt(StateSelectedElement.getComputed('padding-' + direction) || 0)
    // don't allow negative margin/padding
    value = value < 0 ? 0 : value
    return value - change
  },

  setValue (button, counter, direction, value) {
    const visualValue = this.calculate(CanvasOverlayCommon.getVisualValue(value))
    this['set' + ExtendJS.capitalize(direction)](button, visualValue)
    StateTempStyle.setStyleValue('padding-' + direction, value + 'px')
    CanvasOverlayCommon.updateResizeCounter(counter, value)
  },

  calculate (value) {
    return {
      containerBorder: value + 'px'
    }
  },

  setLeft (button, values) {
    button.parentNode.style.borderLeftWidth = values.containerBorder
  },

  setRight (button, values) {
    button.parentNode.style.borderRightWidth = values.containerBorder
  },

  setTop (button, values) {
    button.parentNode.style.borderTopWidth = values.containerBorder
  },

  setBottom (button, values) {
    button.parentNode.style.borderBottomWidth = values.containerBorder
  }
}
