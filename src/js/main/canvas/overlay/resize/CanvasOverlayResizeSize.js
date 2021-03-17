import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import HelperElement from '../../../../helper/HelperElement.js'
import CanvasOverlayCommon from '../CanvasOverlayCommon.js'
import StateTempStyle from '../../../../state/StateTempStyle.js'

export default {
  resize (button, counter, direction, changeX, changeY) {
    const element = StateSelectedElement.getElement()
    this.setValues(element, changeX, changeY, counter, direction)
  },

  setValues (element, changeX, changeY, counter, direction) {
    const pos = HelperElement.getPosition(element)
    if (changeY) {
      this.setValue('height', parseInt(pos.heightNoZoom + changeY), counter, direction)
    }
    if (changeX) {
      this.setValue('width', parseInt(pos.widthNoZoom + changeX), counter, direction)
    }
  },

  setValue (name, value, counter, direction) {
    StateTempStyle.setStyleValue(name, value + 'px')
    this.updateCounter(value, counter, direction)
  },

  updateCounter (value, counter, direction) {
    if (this.shouldShowCounter(direction)) CanvasOverlayCommon.updateResizeCounter(counter, value)
  },

  shouldShowCounter (direction) {
    return ['top', 'bottom', 'left', 'right'].includes(direction)
  }
}
