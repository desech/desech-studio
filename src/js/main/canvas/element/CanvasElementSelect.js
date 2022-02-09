import HelperEvent from '../../../helper/HelperEvent.js'
import StateSelectedElement from '../../../state/StateSelectedElement.js'
import HelperCanvas from '../../../helper/HelperCanvas.js'
import StateSelectedVariable from '../../../state/StateSelectedVariable.js'

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

  mousedownStartOperationEvent (event) {
    if ((event.target.closest('#canvas .element') || event.target.id === 'canvas' ||
      event.target.classList.contains('canvas-container')) && HelperEvent.isLeftClick(event) &&
      HelperCanvas.canInteract()) {
      this.startOperation(event.target.closest('#canvas .element') || event.target)
    }
  },

  mouseupEndSelectElementEvent (event) {
    if (this._node && this._node.classList.contains('element')) {
      if (HelperCanvas.isOperation('selecting')) {
        StateSelectedElement.selectElement(this._node)
      }
      this.clearState()
    }
  },

  mouseupEndDeselectElementEvent (event) {
    if (this._node && !this._node.classList.contains('element')) {
      if (HelperCanvas.isOperation('selecting')) {
        StateSelectedElement.deselectElement()
      }
      this.clearState()
    }
  },

  ignoreElementEvent (event) {
    // stop all clicks and most mousedowns, except the ones where we edit the text
    if (event.target.closest('.element') && !HelperCanvas.isPreview() &&
      (event.type === 'click' || !HelperCanvas.isOperation('editing'))) {
      event.preventDefault()
    }
  },

  // if we have a variable selected, then ignore this
  keydownDeselectElementEvent (event) {
    if (event.key && HelperEvent.areMainShortcutsAllowed(event) &&
      HelperEvent.isNotCtrlAltShift(event) && !HelperCanvas.isPreview() &&
      event.key === 'Escape' && !StateSelectedVariable.getRef()) {
      StateSelectedElement.deselectElement()
    }
  },

  startOperation (node) {
    this._node = node
    HelperCanvas.setCanvasData('operation', 'selecting')
  },

  clearState () {
    this._node = null
    HelperCanvas.deleteCanvasData('operation')
  }
}
