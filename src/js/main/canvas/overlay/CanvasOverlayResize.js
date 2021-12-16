import ExtendJS from '../../../helper/ExtendJS.js'
import HelperEvent from '../../../helper/HelperEvent.js'
import CanvasOverlayResizeSize from './resize/CanvasOverlayResizeSize.js'
import CanvasOverlayResizeMargin from './resize/CanvasOverlayResizeMargin.js'
import CanvasOverlayResizePadding from './resize/CanvasOverlayResizePadding.js'
import CanvasOverlayCommon from './CanvasOverlayCommon.js'
import HelperCanvas from '../../../helper/HelperCanvas.js'
import StateTempStyle from '../../../state/StateTempStyle.js'
import CanvasOverlayGridSetup from './grid/CanvasOverlayGridSetup.js'
import CanvasCommon from '../CanvasCommon.js'

export default {
  // the resize button dictating the operation type (size, margin, padding) and direction
  // (left, right, top, bottom)
  _button: null,
  // the starting coordinates to calculate the +/-1 px for each increment
  _startX: null,
  _startY: null,

  getEvents () {
    return {
      mousedown: ['mousedownEvent'],
      mousemove: ['mousemoveEvent'],
      mouseup: ['mouseupEndEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  mousedownEvent (event) {
    if (event.target.classList.contains('resize-button') && !HelperCanvas.getOperation()) {
      this.prepareResize(event.target, event.clientX, event.clientY)
    }
  },

  mousemoveEvent (event) {
    if (HelperCanvas.isOperation('resizing') && this._button && event.buttons) {
      this.resizeElement(event.clientX, event.clientY, event.altKey, event.shiftKey)
    }
  },

  async mouseupEndEvent (event) {
    if (this._button) {
      if (HelperCanvas.isOperation('resizing')) {
        await this.finalizeElementResize()
      }
      this.clearState()
    }
  },

  prepareResize (button, clientX, clientY) {
    HelperCanvas.setCanvasData('operation', 'resizing')
    this._button = button
    this._startX = CanvasCommon.getMouseX(clientX)
    this._startY = CanvasCommon.getMouseY(clientY)
  },

  resizeElement (clientX, clientY, altKey, shiftKey) {
    const { changeX, changeY } = this.initMousePosition(clientX, clientY)
    const value = this.resizeValue(changeX, changeY)
    this.resizeMultiple(altKey, shiftKey, value)
    CanvasOverlayCommon.positionOverlay()
    const type = document.getElementById('element-overlay').dataset.mode
    // @todo find a more efficient way
    if (type === 'grid') CanvasOverlayGridSetup.setupGrid()
  },

  initMousePosition (clientX, clientY) {
    const mouseX = CanvasCommon.getMouseX(clientX)
    const mouseY = CanvasCommon.getMouseY(clientY)
    const { changeX, changeY } = this.getMouseChange(mouseX, mouseY)
    this.setMouseStart(changeX, changeY, mouseX, mouseY)
    return { changeX, changeY }
  },

  getMouseChange (mouseX, mouseY) {
    let changeX = 0
    let changeY = 0
    switch (this._button.dataset.direction) {
      case 'left':
        changeX = this._startX - mouseX
        break
      case 'right':
        changeX = mouseX - this._startX
        break
      case 'top':
        changeY = this._startY - mouseY
        break
      case 'bottom':
        changeY = mouseY - this._startY
        break
      case 'nw':
        changeX = this._startX - mouseX
        changeY = this._startY - mouseY
        break
      case 'ne':
        changeX = mouseX - this._startX
        changeY = this._startY - mouseY
        break
      case 'sw':
        changeX = this._startX - mouseX
        changeY = mouseY - this._startY
        break
      case 'se':
        changeX = mouseX - this._startX
        changeY = mouseY - this._startY
        break
    }
    return { changeX, changeY }
  },

  setMouseStart (changeX, changeY, mouseX, mouseY) {
    if (changeX) this._startX = mouseX
    if (changeY) this._startY = mouseY
  },

  resizeValue (changeX, changeY) {
    const counter = this._button.parentNode.getElementsByClassName('resize-counter')[0]
    const obj = this.getTypeClass()
    return obj.resize(this._button, counter, this._button.dataset.direction, changeX, changeY)
  },

  getTypeClass (type = null) {
    type = type || this._button.parentNode.dataset.type
    switch (type) {
      case 'size':
        return CanvasOverlayResizeSize
      case 'margin':
        return CanvasOverlayResizeMargin
      case 'padding':
        return CanvasOverlayResizePadding
    }
  },

  resizeMultiple (altKey, shiftKey, value) {
    if (this._button.parentNode.dataset.type !== 'size') {
      // when pressing the ALT key we will change the other direction too
      if (altKey) this.resizeMultipleAltKey(value)
      // when pressing the SHIFT key we change all directions
      if (shiftKey) this.resizeMultipleShiftKey(value)
    }
  },

  resizeMultipleAltKey (value) {
    const otherDirection = this.getOtherDirection(this._button.dataset.direction)
    this.setDirection(otherDirection, value)
    const property = this._button.parentNode.dataset.type + '-' + otherDirection
    StateTempStyle.setStyleValue(property, value + 'px')
  },

  getOtherDirection (direction) {
    const map = {
      left: 'right',
      right: 'left',
      top: 'bottom',
      bottom: 'top'
    }
    return map[direction]
  },

  setDirection (otherDirection, value) {
    const container = this._button.parentNode
    const otherButton = container.getElementsByClassName('resize-' + otherDirection)[0]
    const obj = this.getTypeClass()
    obj['set' + ExtendJS.capitalize(otherDirection)](otherButton, obj.calculate(value))
  },

  resizeMultipleShiftKey (value) {
    const otherDirections = this.getAllOtherDirections(this._button.dataset.direction)
    for (const otherDirection of Object.values(otherDirections)) {
      this.setDirection(otherDirection, value)
    }
    const property = this._button.parentNode.dataset.type
    // this will set all margin/padding properties
    StateTempStyle.setStyleValue(property, value + 'px')
  },

  getAllOtherDirections (direction) {
    const list = {
      left: 'left',
      right: 'right',
      top: 'top',
      bottom: 'bottom'
    }
    delete list[direction]
    return list
  },

  async finalizeElementResize () {
    this.hideCounters()
    // we do want to reload the side panel and ignore zeros
    await StateTempStyle.applyStyleValue(true, true)
  },

  hideCounters () {
    for (const resize of document.getElementsByClassName('resize-counter')) {
      resize.style.opacity = 0
    }
  },

  clearState () {
    HelperCanvas.deleteCanvasData('operation')
    this._button = null
    this._startX = null
    this._startY = null
  }
}
