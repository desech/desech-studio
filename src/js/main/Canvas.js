import HelperDOM from '../helper/HelperDOM.js'
import HelperEvent from '../helper/HelperEvent.js'
import HelperElement from '../helper/HelperElement.js'
import CanvasCommon from './canvas/CanvasCommon.js'
import HelperCanvas from '../helper/HelperCanvas.js'

export default {
  getEvents () {
    return {
      click: ['clickPanelButtonEvent', 'clickPanelButtonListEvent'],
      keydown: ['keydownPanelButtonEvent']
    }
  },

  clickPanelButtonEvent (event) {
    if (event.target.closest('.tool-button')) {
      this.enableButton(event.target.closest('.tool-button').dataset.type)
    }
  },

  clickPanelButtonListEvent (event) {
    if (event.target.closest('.tool-button-list-elem')) {
      this.switchPanelButton(event.target.closest('.tool-button-list-elem'))
    }
  },

  keydownPanelButtonEvent (event) {
    if (event.key && HelperEvent.areMainShortcutsAllowed(event) &&
      HelperEvent.isNotCtrlAltShift(event) && !HelperCanvas.isPreview() &&
      HelperElement.getKeys().includes(event.key.toLowerCase())) {
      this.enableButton(HelperElement.getElementByKey(event.key.toLowerCase()))
    }
  },

  switchPanelButton (element) {
    const container = element.closest('.tool-button-dropdown').previousElementSibling
    this.setPanelButton(container, element.dataset.type)
    this.enableButton(element.dataset.type)
  },

  setPanelButton (container, type) {
    HelperDOM.hide(container.children)
    HelperDOM.show(container.querySelector(`[data-type="${type}"]`))
  },

  enableButton (type) {
    CanvasCommon.enablePanelButton(type)
    // @todo the mouse position is not present in keyboard events
    // we need to save it on mousemove constantly, and access it here
    // const node = StateSelectedElement.getElement() || HelperCanvas.getCanvas()
    // CanvasElementCreate.addPlacementMarker(node, clientX, clientY)
  }
}
