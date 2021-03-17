import HelperError from './HelperError.js'
import HelperCanvas from './HelperCanvas.js'

export default {
  addEvents (obj, events) {
    for (const event of events) {
      window.addEventListener(event, obj)
    }
  },

  removeEvents (obj, events) {
    for (const event of events) {
      window.removeEventListener(event, obj)
    }
  },

  handleEvents (obj, event) {
    try {
      this.handleEachEvent(obj, event).catch(error => {
        HelperError.error(error)
      })
    } catch (error) {
      HelperError.error(error)
    }
  },

  async handleEachEvent (obj, event) {
    for (const [type, events] of Object.entries(obj.getEvents())) {
      for (const eventName of events) {
        if (event.type === type && !event.defaultPrevented) {
          // preventDefault() will stop the rest of the events of the same type,
          // from all the handlers
          await obj[eventName](event)
        }
      }
    }
  },

  areMainShortcutsAllowed (event) {
    return HelperCanvas.getMain() && this.areShortcutsAllowed(event)
  },

  areShortcutsAllowed (event) {
    const isField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)
    const isEditable = event.target.hasAttributeNS(null, 'contenteditable')
    return !isField && !isEditable
  },

  isNotCtrlAltShift (event) {
    return !this.isCtrlCmd(event) && !event.altKey && !event.shiftKey
  },

  isCtrlCmd (event) {
    return (event.ctrlKey || event.metaKey)
  }
}
