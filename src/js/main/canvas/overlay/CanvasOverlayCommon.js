import HelperElement from '../../../helper/HelperElement.js'
import StateSelectedElement from '../../../state/StateSelectedElement.js'
import StateStyleSheet from '../../../state/StateStyleSheet.js'
import HelperRegex from '../../../helper/HelperRegex.js'
import ExtendJS from '../../../helper/ExtendJS.js'
import InputUnitField from '../../../component/InputUnitField.js'
import HelperDOM from '../../../helper/HelperDOM.js'
import HelperCanvas from '../../../helper/HelperCanvas.js'

export default {
  positionOverlay () {
    const overlay = document.getElementById('element-overlay')
    const element = StateSelectedElement.getElement()
    if (!element) return
    const style = StateSelectedElement.getComputedStyle()
    const pos = HelperElement.getPosition(element)
    this.setPosition(overlay, pos)
    this.setBorders(element, overlay, style)
  },

  setPosition (overlay, pos) {
    overlay.style.width = pos.width + 'px'
    overlay.style.height = pos.height + 'px'
    overlay.style.left = pos.relativeLeft + 'px'
    overlay.style.top = pos.relativeTop + 'px'
  },

  setBorders (element, overlay, style) {
    this.setSizeBorders(overlay, style)
    if (HelperElement.getType(element) === 'component') {
      HelperDOM.hide(overlay.getElementsByClassName('resize-button'))
    } else {
      this.setPaddingBorders(overlay)
    }
  },

  setSizeBorders (overlay, style) {
    const box = overlay.getElementsByClassName('resize-size')[0]
    if (!box) return
    for (const dir of ['top', 'bottom', 'left', 'right']) {
      this.setSizeBorder(box, dir, style)
    }
  },

  setSizeBorder (box, dir, style) {
    const property = `border-${dir}-width`
    // min value is 1px
    box.style[property] = parseInt(style[property]) > 1 ? style[property] : '1px'
  },

  setPaddingBorders (overlay) {
    const padding = overlay.getElementsByClassName('resize-padding')[0]
    const size = overlay.getElementsByClassName('resize-size')[0]
    if (!padding || !size) return
    this.setPaddingBordersStyle(padding, size)
  },

  setPaddingBordersStyle (padding, size) {
    padding.style.top = size.style.borderTopWidth
    padding.style.left = size.style.borderLeftWidth
    this.setPaddingBorderWidth(padding, size)
    this.setPaddingBorderHeight(padding, size)
  },

  setPaddingBorderWidth (padding, size) {
    const border = parseInt(size.style.borderLeftWidth) + parseInt(size.style.borderRightWidth)
    padding.style.width = `calc(100% - ${border}px)`
  },

  setPaddingBorderHeight (padding, size) {
    const border = parseInt(size.style.borderTopWidth) + parseInt(size.style.borderBottomWidth)
    padding.style.height = `calc(100% - ${border}px)`
  },

  updateResizeCounter (counter, value) {
    counter.textContent = value
    counter.style.opacity = 1
  },

  getTrackArray (type, style = null) {
    const property = `grid-template-${type}s`
    const track = style ? style[property] : StateStyleSheet.getPropertyValue(property)
    if (!track) return
    const array = HelperRegex.splitNoParenthesis(track)
    return this.formatArray(array)
  },

  formatArray (array) {
    const formatted = []
    for (const val of array) {
      if (val) formatted.push(this.formatValue(val))
    }
    return formatted
  },

  formatValue (string) {
    if (ExtendJS.startsNumeric(string)) {
      const number = InputUnitField.getNumericValue(string)
      return ExtendJS.roundToTwo(number[0]) + number[1]
    } else {
      return string
    }
  },

  getVisualValue (value) {
    const zoom = HelperCanvas.getZoomFactor()
    return Math.round(value * zoom)
  },

  isOverlaySmall () {
    const container = document.getElementsByClassName('element-overlay-container')[0]
    return (container.classList.contains('small-width') ||
      container.classList.contains('small-height'))
  }
}
