import CanvasOverlay from '../CanvasOverlay.js'
import HelperEvent from '../../../helper/HelperEvent.js'
import StateSelectedElement from '../../../state/StateSelectedElement.js'
import HelperCanvas from '../../../helper/HelperCanvas.js'
import HelperElement from '../../../helper/HelperElement.js'
import HelperTrigger from '../../../helper/HelperTrigger.js'
import LeftCommon from '../../left/LeftCommon.js'
import CanvasCommon from '../CanvasCommon.js'

export default {
  _node: null,

  getEvents () {
    return {
      mousedown: ['mousedownStartOperationEvent', 'ignoreElementEvent'],
      mouseup: ['mouseupEndSelectElementEvent', 'mouseupEndDeselectElementEvent'],
      click: ['ignoreElementEvent'],
      keydown: ['keydownDeselectElementEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  mousedownStartOperationEvent (event) {
    if ((event.target.closest('#canvas .element') || event.target.id === 'canvas' ||
      event.target.classList.contains('canvas-container')) && HelperCanvas.canInteract()) {
      this.startOperation(event.target.closest('#canvas .element') || event.target)
    }
  },

  mouseupEndSelectElementEvent (event) {
    if (this._node && this._node.classList.contains('element')) {
      if (HelperCanvas.getOperation() === 'selecting') {
        this.selectElement(this._node)
      }
      this.clearState()
    }
  },

  mouseupEndDeselectElementEvent (event) {
    if (this._node && !this._node.classList.contains('element')) {
      if (HelperCanvas.getOperation() === 'selecting') {
        this.deselectElement()
      }
      this.clearState()
    }
  },

  ignoreElementEvent (event) {
    // stop all clicks and most mousedowns, except the ones where we edit the text
    if (event.target.closest('.element') && !HelperCanvas.isPreview() &&
      (event.type === 'click' || HelperCanvas.getOperation() !== 'editing')) {
      event.preventDefault()
    }
  },

  keydownDeselectElementEvent (event) {
    if (event.key && HelperEvent.areMainShortcutsAllowed(event) &&
      HelperEvent.isNotCtrlAltShift(event) && !HelperCanvas.isPreview() &&
      event.key === 'Escape') {
      this.deselectElement()
    }
  },

  startOperation (node) {
    this._node = node
    HelperCanvas.setCanvasData('operation', 'selecting')
  },

  clearState () {
    this._node = null
    HelperCanvas.deleteCanvasData('operation')
  },

  selectElement (element) {
    element = CanvasCommon.getClosestElementOrComponent(element)
    const selectedElement = StateSelectedElement.getElement()
    if (selectedElement === element) return element
    this.deselectElement()
    this.selectElementNode(element)
    this.scrollToItem(element)
    return element
  },

  selectElementNode (element) {
    element.classList.add('selected')
    const ref = HelperElement.getRef(element)
    HelperCanvas.setCanvasData('selectedElement', ref)
    this.updateUiAfterElementSelect(ref)
  },

  updateUiAfterElementSelect (ref) {
    LeftCommon.selectItemByRef(ref)
    CanvasOverlay.reloadOverlay()
  },

  deselectElement () {
    const element = StateSelectedElement.getElement()
    if (!element) return
    element.classList.remove('selected')
    HelperCanvas.deleteCanvasData('selectedElement')
    this.updateUiAfterElementDeselect()
  },

  updateUiAfterElementDeselect () {
    LeftCommon.deselectItem()
    CanvasOverlay.clearOverlay()
    HelperTrigger.triggerClear('right-panel-style')
  },

  scrollToItem (element) {
    // doesn't work right, disable it for now
    // const pos = HelperElement.getPosition(element)
    // const container = element.closest('.canvas-container')
    // if (HelperDOM.isInView(pos.leftWithScroll, pos.topWithScroll, container)) return
    // const align = (pos.height < 300) ? 'center' : 'start'
    // element.scrollIntoView({ block: align, inline: align })
  }
}
