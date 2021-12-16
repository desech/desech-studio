import HelperEvent from '../../../helper/HelperEvent.js'
import CanvasElementInline from '../element/CanvasElementInline.js'
import CanvasTextOverlay from '../CanvasTextOverlay.js'
import HelperCanvas from '../../../helper/HelperCanvas.js'
import CanvasElementText from '../element/CanvasElementText.js'

export default {
  getEvents () {
    return {
      keydown: ['keydownHideTextOverlayEvent'],
      click: ['clickToggleTextOverlayEvent', 'clickButtonEvent', 'clickClearFormattingEvent'],
      change: ['changeOtherTagsEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickToggleTextOverlayEvent (event) {
    if (HelperCanvas.isOperation('editing') && !event.target.closest('#text-overlay')) {
      this.toggleTextOverlay(event.clientX, event.clientY)
    }
  },

  keydownHideTextOverlayEvent (event) {
    if (event.key && HelperCanvas.isOperation('editing') &&
      !event.target.closest('#text-overlay')) {
      this.hideTextOverlay()
    }
  },

  clickButtonEvent (event) {
    if (event.target.closest('.text-overlay-button')) {
      this.enableTag(event.target.closest('.text-overlay-button'))
    }
  },

  changeOtherTagsEvent (event) {
    if (event.target.classList.contains('text-overlay-select')) {
      this.enableTag(event.target)
    }
  },

  clickClearFormattingEvent (event) {
    if (event.target.closest('.text-overlay-clear')) {
      this.clearFormatting()
    }
  },

  toggleTextOverlay (clientX, clientY) {
    if (window.getSelection().isCollapsed) {
      CanvasTextOverlay.clearOverlay()
    } else {
      CanvasTextOverlay.reloadOverlay(clientX, clientY)
    }
  },

  hideTextOverlay () {
    CanvasTextOverlay.clearOverlay()
  },

  enableTag (node) {
    CanvasElementInline.createElement(node.value, window.getSelection())
    CanvasTextOverlay.clearOverlay()
  },

  clearFormatting () {
    CanvasElementInline.deleteElement(window.getSelection())
    CanvasTextOverlay.clearOverlay()
    CanvasElementText.textHasChanged()
  }
}
