import HelperEvent from '../../helper/HelperEvent.js'
import HelperCanvas from '../../helper/HelperCanvas.js'
import CanvasCommon from './CanvasCommon.js'

export default {
  _previousX: 0,
  _previousY: 0,
  _start: false,

  getEvents () {
    return {
      keydown: ['keydownPanStartSpaceEvent'],
      keyup: ['keyupPanEndSpaceEvent'],
      mousedown: ['mousedownPanStartEvent'],
      mousemove: ['mousemovePanMoveEvent'],
      mouseup: ['mouseupPanEndEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  keydownPanStartSpaceEvent (event) {
    if (event.key && HelperEvent.areMainShortcutsAllowed(event) &&
      HelperEvent.isNotCtrlAltShift(event) && event.code === 'Space') {
      if (!HelperCanvas.getOperation()) this.panStart(event.clientX, event.clientY)
      // stop scrolling down with default Space key
      event.preventDefault()
    }
  },

  keyupPanEndSpaceEvent (event) {
    if (event.key && HelperCanvas.getOperation() === 'panning' &&
      HelperEvent.areMainShortcutsAllowed(event) && HelperEvent.isNotCtrlAltShift(event) &&
      event.code === 'Space') {
      this.panEnd()
    }
  },

  mousedownPanStartEvent (event) {
    if (event.target.closest('#canvas') && HelperCanvas.getTool() === 'hand' &&
      event.detail === 1) {
      this.panStart(event.clientX, event.clientY)
    }
  },

  mousemovePanMoveEvent (event) {
    if (this._start && event.buttons) {
      this.panMove(event.clientX, event.clientY)
    }
  },

  mouseupPanEndEvent (event) {
    if (this._start) {
      this.panEnd()
    }
  },

  panStart (clientX, clientY) {
    HelperCanvas.setCanvasData('operation', 'panning')
    CanvasCommon.removePlacementMarker()
    this._start = true
    this._previousX = clientX
    this._previousY = clientY
  },

  panMove (clientX, clientY) {
    let dragX = 0
    let dragY = 0
    if (clientX - this._previousX !== 0) {
      dragX = this._previousX - clientX
      this._previousX = clientX
    }
    if (clientY - this._previousY !== 0) {
      dragY = this._previousY - clientY
      this._previousY = clientY
    }
    if (dragX !== 0 || dragY !== 0) {
      HelperCanvas.getCanvasContainer().scrollBy(dragX, dragY)
    }
  },

  panEnd () {
    HelperCanvas.deleteCanvasData('operation')
    this._start = false
    this._previousX = 0
    this._previousY = 0
  }
}
