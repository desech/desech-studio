import HelperEvent from '../../../helper/HelperEvent.js'
import HelperCanvas from '../../../helper/HelperCanvas.js'
import CanvasElementSelect from './CanvasElementSelect.js'
import CanvasElementCreate from './CanvasElementCreate.js'
import CanvasElement from '../CanvasElement.js'
import CanvasElementManage from './CanvasElementManage.js'
import HelperDOM from '../../../helper/HelperDOM.js'
import HelperElement from '../../../helper/HelperElement.js'
import HelperTrigger from '../../../helper/HelperTrigger.js'
import CanvasCommon from '../CanvasCommon.js'

export default {
  // check if we started movement; we use `pointer-events: none`
  _element: null,
  _moving: false,
  // check if we actually moved more than X pixels
  _startX: null,
  _startY: null,
  // the grabbing relative distance
  _grabX: null,
  _grabY: null,

  getEvents () {
    return {
      mousedown: ['mousedownStartMoveEvent'],
      mousemove: ['mousemoveContinueMoveEvent'],
      mouseup: ['mouseupEndMoveEvent'],
      wheel: ['wheelAdjustPositionEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  mousedownStartMoveEvent (event) {
    if (event.target.closest('.element') && HelperCanvas.canInteract()) {
      this.prepareMovement(event.target.closest('.element'), event.clientX, event.clientY)
    }
  },

  mousemoveContinueMoveEvent (event) {
    if (this._element && event.buttons) {
      if (!this._moving) {
        this.initMovement(event.target, event.clientX, event.clientY)
      } else if (HelperCanvas.getOperation() === 'moving') {
        this.moveElement(event.target, event.clientX, event.clientY)
      }
    }
  },

  mouseupEndMoveEvent (event) {
    if (this._element) {
      if (this._moving && HelperCanvas.getOperation() === 'moving') {
        this.finalizeElementMove(event.altKey)
      }
      // clear it when moving was initialized but not executed
      this.clearState()
    }
  },

  wheelAdjustPositionEvent (event) {
    if (HelperCanvas.getOperation() === 'moving' && this._element && event.buttons) {
      // @todo fix the element position when scrolling during element movement
      // this.moveElement(event.target, event.clientX, event.clientY)
    }
  },

  prepareMovement (element, clientX, clientY) {
    if (HelperElement.getType(element) === 'inline') return
    element = CanvasCommon.getClosestElementOrComponent(element)
    this._element = element
    this.setPositions(clientX, clientY)
    this._moving = false
  },

  setPositions (clientX, clientY) {
    const pos = HelperElement.getPosition(this._element)
    const canvas = HelperCanvas.getCanvas()
    const zoom = HelperCanvas.getZoomFactor()
    this._startX = clientX
    this._startY = clientY
    this._grabX = clientX - pos.relativeLeft + Math.round(canvas.offsetLeft * zoom)
    this._grabY = clientY - pos.relativeTop + Math.round(canvas.offsetTop * zoom)
  },

  initMovement (target, clientX, clientY) {
    if (!this.hasMoved(clientX, clientY)) return
    this._moving = true
    HelperCanvas.setCanvasData('operation', 'moving')
    // we don't want selection when moving
    CanvasElementSelect.deselectElement()
    this._element.classList.add('moving')
    this.moveElement(target, clientX, clientY)
  },

  hasMoved (clientX, clientY) {
    // only start moving when there's an X pixels movement difference
    const delta = 10
    const diffX = Math.abs(this._startX - clientX)
    const diffY = Math.abs(this._startY - clientY)
    return (diffX > delta || diffY > delta)
  },

  moveElement (target, clientX, clientY) {
    const zoom = HelperCanvas.getZoomFactor()
    this._element.style.left = Math.round((clientX - this._grabX) / zoom) + 'px'
    this._element.style.top = Math.round((clientY - this._grabY) / zoom) + 'px'
    CanvasElementCreate.addPlacementMarker(target, clientX, clientY)
  },

  finalizeElementMove (altKey) {
    HelperCanvas.deleteCanvasData('operation')
    HelperDOM.clearStyle(this._element)
    this._element.classList.remove('moving')
    this.moveElementInCanvas(this._element, altKey)
  },

  moveElementInCanvas (element, altKey = false) {
    const newElement = this.cloneElementFromMoving(element)
    if (!altKey) this.hideElementInCanvas(element)
    // select it after you've hidden the old element
    CanvasElementSelect.selectElement(newElement)
    const newRef = HelperElement.getRef(newElement)
    const ref = HelperElement.getRef(element)
    CanvasElement.moveElementCommand(newRef, ref, false)
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'element' })
  },

  hideElementInCanvas (element) {
    HelperDOM.hide(element)
    delete element.dataset.ssHidden
  },

  cloneElementFromMoving (element) {
    const newElement = CanvasElement.cloneElement(element)
    CanvasElementManage.createPastedElement(newElement)
    return newElement
  },

  clearState () {
    this._element = null
    this._startX = null
    this._startY = null
    this._grabX = null
    this._grabY = null
    this._moving = false
  }
}
