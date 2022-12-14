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
          if (!obj[eventName]) throw new Error(`Unknown event ${eventName}`)
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
    const isEditing = HelperCanvas.isOperation('editing')
    return !isField && !isEditing
  },

  isNotCtrlAltShift (event) {
    return !this.isCtrlCmd(event) && !event.altKey && !event.shiftKey
  },

  isCtrlCmd (event) {
    return (event.ctrlKey || event.metaKey)
  },

  isLeftClick (event) {
    return (event.button === 0)
  }
}
