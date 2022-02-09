import HelperEvent from '../../../helper/HelperEvent.js'
import HelperCanvas from '../../../helper/HelperCanvas.js'
import CanvasElementCopyElement from './copypaste/CanvasElementCopyElement.js'
import CanvasElementCopyAttrStyle from './copypaste/CanvasElementCopyAttrStyle.js'
import CanvasElementCopySelector from './copypaste/CanvasElementCopySelector.js'

export default {
  getEvents () {
    return {
      keydown: ['keydownDeleteElementEvent', 'keydownCopyElementEvent', 'keydownCutElementEvent',
        'keydownPasteElementEvent', 'keydownDuplicateElementEvent', 'keydownCopyAllEvent',
        'keydownCopyAttributesEvent', 'keydownCopyStyleEvent', 'keydownPasteAllEvent',
        'keydownCopySelectorEvent', 'keydownCutSelectorEvent', 'keydownPasteSelectorEvent']
    }
  },

  async keydownDeleteElementEvent (event) {
    if (event.key && HelperEvent.areMainShortcutsAllowed(event) &&
      HelperEvent.isNotCtrlAltShift(event) && !HelperCanvas.isPreview() &&
      (event.key.toLowerCase() === 'delete' || event.key.toLowerCase() === 'backspace')) {
      await CanvasElementCopyElement.deleteElement()
    }
  },

  async keydownCopyElementEvent (event) {
    if (event.key && HelperEvent.areMainShortcutsAllowed(event) &&
      event.key.toLowerCase() === 'c' && !HelperCanvas.isPreview() &&
      HelperEvent.isCtrlCmd(event) && !event.altKey && !event.shiftKey) {
      await CanvasElementCopyElement.copyElement()
    }
  },

  async keydownCutElementEvent (event) {
    if (event.key && HelperEvent.areMainShortcutsAllowed(event) &&
      event.key.toLowerCase() === 'x' && !HelperCanvas.isPreview() &&
      HelperEvent.isCtrlCmd(event) && !event.altKey && !event.shiftKey) {
      await CanvasElementCopyElement.cutElement()
    }
  },

  async keydownPasteElementEvent (event) {
    if (event.key && HelperEvent.areMainShortcutsAllowed(event) &&
      event.key.toLowerCase() === 'v' && !HelperCanvas.isPreview() &&
      HelperEvent.isCtrlCmd(event) && !event.altKey && !event.shiftKey) {
      await CanvasElementCopyElement.pasteElement()
    }
  },

  async keydownDuplicateElementEvent (event) {
    if (event.key && HelperEvent.areMainShortcutsAllowed(event) &&
      event.key.toLowerCase() === 'd' && !HelperCanvas.isPreview() &&
      HelperEvent.isCtrlCmd(event) && !event.altKey && !event.shiftKey) {
      await CanvasElementCopyElement.duplicateElement()
    }
  },

  async keydownCopyAllEvent (event) {
    if (event.key && HelperEvent.areMainShortcutsAllowed(event) &&
      event.key.toLowerCase() === 'c' && !HelperCanvas.isPreview() &&
      HelperEvent.isCtrlCmd(event) && !event.altKey && event.shiftKey) {
      await CanvasElementCopyAttrStyle.copyAttrStyle()
    }
  },

  async keydownCopyAttributesEvent (event) {
    if (event.key && HelperEvent.areMainShortcutsAllowed(event) &&
      event.key.toLowerCase() === 'a' && !HelperCanvas.isPreview() &&
      HelperEvent.isCtrlCmd(event) && !event.altKey && event.shiftKey) {
      await CanvasElementCopyAttrStyle.copyAttributes()
    }
  },

  async keydownCopyStyleEvent (event) {
    if (event.key && HelperEvent.areMainShortcutsAllowed(event) &&
      event.key.toLowerCase() === 's' && !HelperCanvas.isPreview() &&
      HelperEvent.isCtrlCmd(event) && !event.altKey && event.shiftKey) {
      await CanvasElementCopyAttrStyle.copyStyle()
    }
  },

  async keydownPasteAllEvent (event) {
    if (event.key && HelperEvent.areMainShortcutsAllowed(event) &&
      event.key.toLowerCase() === 'v' && !HelperCanvas.isPreview() &&
      HelperEvent.isCtrlCmd(event) && !event.altKey && event.shiftKey) {
      await CanvasElementCopyAttrStyle.pasteAttrStyle()
    }
  },

  async keydownCopySelectorEvent (event) {
    if (event.key && HelperEvent.areMainShortcutsAllowed(event) &&
      event.key.toLowerCase() === 'c' && !HelperCanvas.isPreview() &&
      HelperEvent.isCtrlCmd(event) && event.altKey && !event.shiftKey) {
      await CanvasElementCopySelector.copySelector()
    }
  },

  async keydownCutSelectorEvent (event) {
    if (event.key && HelperEvent.areMainShortcutsAllowed(event) &&
      event.key.toLowerCase() === 'x' && !HelperCanvas.isPreview() &&
      HelperEvent.isCtrlCmd(event) && event.altKey && !event.shiftKey) {
      await CanvasElementCopySelector.cutSelector()
    }
  },

  async keydownPasteSelectorEvent (event) {
    if (event.key && HelperEvent.areMainShortcutsAllowed(event) &&
      event.key.toLowerCase() === 'v' && !HelperCanvas.isPreview() &&
      HelperEvent.isCtrlCmd(event) && event.altKey && !event.shiftKey) {
      await CanvasElementCopySelector.pasteSelector()
    }
  }
}
