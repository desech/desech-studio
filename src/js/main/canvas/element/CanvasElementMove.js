import HelperEvent from '../../../helper/HelperEvent.js'
import HelperCanvas from '../../../helper/HelperCanvas.js'
import CanvasElementCreate from './CanvasElementCreate.js'
import CanvasElement from '../CanvasElement.js'
import CanvasElementCopyElement from './copypaste/CanvasElementCopyElement.js'
import HelperDOM from '../../../helper/HelperDOM.js'
import HelperElement from '../../../helper/HelperElement.js'
import HelperTrigger from '../../../helper/HelperTrigger.js'
import HelperComponent from '../../../helper/HelperComponent.js'
import Crypto from '../../../../electron/lib/Crypto.js'
import StateSelectedElement from '../../../state/StateSelectedElement.js'

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
      mouseup: ['mouseupEndMoveEvent']
    }
  },

  mousedownStartMoveEvent (event) {
    if (event.target.closest('.element') && HelperEvent.isLeftClick(event) &&
      HelperCanvas.canInteract()) {
      this.prepareMovement(event.target.closest('.element'), event.clientX, event.clientY)
    }
  },

  mousemoveContinueMoveEvent (event) {
    if (this._element && event.buttons) {
      if (!this._moving) {
        this.initMovement(event.target, event.clientX, event.clientY)
      } else if (HelperCanvas.isOperation('moving')) {
        this.moveElement(event.target, event.clientX, event.clientY)
      }
    }
  },

  async mouseupEndMoveEvent (event) {
    if (this._element) {
      if (this._moving && HelperCanvas.isOperation('moving')) {
        await this.finalizeElementMove(event.altKey)
      }
      // clear it when moving was initialized but not executed
      this.clearState()
    }
  },

  prepareMovement (element, clientX, clientY) {
    const type = HelperElement.getType(element)
    if (type === 'body' || type === 'inline') return
    element = HelperComponent.getMovableElement(element)
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
    StateSelectedElement.deselectElement()
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
    // don't move the element along the cursor
    // const zoom = HelperCanvas.getZoomFactor()
    // this._element.style.left = Math.round((clientX - this._grabX) / zoom) + 'px'
    // this._element.style.top = Math.round((clientY - this._grabY) / zoom) + 'px'
    CanvasElementCreate.addPlacementMarker(target, clientX, clientY)
  },

  async finalizeElementMove (altKey) {
    HelperCanvas.deleteCanvasData('operation')
    HelperDOM.clearStyle(this._element)
    this._element.classList.remove('moving')
    if (altKey) {
      CanvasElementCopyElement.duplicateElement(this._element)
    } else {
      await this.moveElementInCanvas(this._element)
    }
  },

  async moveElementInCanvas (element) {
    const newElement = this.cloneMoveElement(element)
    CanvasElementCopyElement.addPastedElement(newElement)
    HelperElement.hideInEditor(element)
    StateSelectedElement.selectElementNode(newElement)
    await CanvasElement.tokenCommand(newElement.dataset.ssToken, 'moveElement', false)
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'element' })
  },

  cloneMoveElement (element) {
    element.classList.remove('selected')
    const token = Crypto.generateSmallID()
    const clone = element.cloneNode(true)
    // the clone has the token, while the previous element has the previous token + the new token
    clone.setAttributeNS(null, 'data-ss-token', token)
    CanvasElement.appendToken(element, token)
    return clone
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
