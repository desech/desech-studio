export default {
  triggerReload (id, detail = null) {
    this.triggerCustomEvent('reloadcontainer', id, detail)
  },

  triggerClear (id, detail = null) {
    this.triggerCustomEvent('clearcontainer', id, detail)
  },

  triggerOpenPanel (id, detail = null) {
    this.triggerCustomEvent('openpanel', id, detail)
  },

  triggerCustomEvent (type, id, detail = null) {
    const data = { bubbles: true, cancelable: true }
    if (detail) data.detail = detail
    const event = new CustomEvent(type, data)
    document.getElementById(id).dispatchEvent(event)
  }
}
