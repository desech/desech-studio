import HelperDOM from '../helper/HelperDOM.js'
import HelperEvent from '../helper/HelperEvent.js'

export default {
  _dragged: null,
  _over: null,

  getEvents () {
    return {
      dragstart: ['dragstartEvent'],
      dragend: ['dragendEvent'],
      dragover: ['dragoverEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  dragstartEvent (event) {
    if (HelperDOM.isNode(event.target) && event.target.closest('.dragdrop-element')) {
      this.dragStart(event.target.closest('.dragdrop-element'))
    }
  },

  dragendEvent (event) {
    if (HelperDOM.isNode(event.target) && event.target.closest('.dragdrop-element')) {
      this.dragEnd(event.target.closest('.dragdrop-element'))
    }
  },

  dragoverEvent (event) {
    const element = event.target.closest('.dragdrop-element')
    if (element && element.parentNode === this._dragged.parentNode) {
      // only allow dropping in the same container
      this.dragOver(element, event.clientY)
      // stop other events
      event.preventDefault()
    }
  },

  dragStart (element) {
    this._dragged = element
    element.classList.add('dragdrop-start')
  },

  dragEnd () {
    this.dragDrop()
    if (this._dragged) this._dragged.classList.remove('dragdrop-start')
    if (this._over) this._over.classList.remove('dragdrop-over')
    this.removeDragOverClasses(this._dragged.parentNode)
    this.clearState()
  },

  clearState () {
    // it's important to clear our the state at the end, otherwise we have leftovers spilling
    this._dragged = null
    this._over = null
  },

  dragOver (element, clientY) {
    if (this._dragged !== element) {
      const y = this.getMouseY(element, clientY)
      this.addOverClass(element, y)
    }
    if (this._over !== element) this._over = element
  },

  addOverClass (element, y) {
    if (element.parentNode.dataset.containerOnly) {
      // container only
      if (element.dataset.container) this.attachOverClass(element, 'inside')
    } else if (element.dataset.container) {
      // container and top/bottom
      this.addContainerOverClass(element, y)
    } else {
      // top/bottom only
      this.addElementOverClass(element, y)
    }
  },

  addContainerOverClass (element, y) {
    if (y <= element.offsetHeight * 0.2) {
      // the first 20%
      this.attachOverClass(element, 'top')
    } else if (y >= element.offsetHeight * 0.8) {
      // the first 80%
      this.attachOverClass(element, 'bottom')
    } else {
      // inside
      this.attachOverClass(element, 'inside')
    }
  },

  addElementOverClass (element, y) {
    if (y <= element.offsetHeight / 2) {
      this.attachOverClass(element, 'top')
    } else {
      this.attachOverClass(element, 'bottom')
    }
  },

  attachOverClass (element, type) {
    if (element.classList.contains(`dragdrop-over-${type}`)) return
    this.removeDragOverClasses(element.parentNode)
    element.classList.add(`dragdrop-over-${type}`)
  },

  removeDragOverClasses (container) {
    for (const elem of container.children) {
      elem.classList.remove('dragdrop-over-top', 'dragdrop-over-bottom', 'dragdrop-over-inside')
    }
  },

  getMouseY (element, clientY) {
    const sidebar = document.getElementById('sidebar-right')
    const panel = document.getElementById('right-panel-style')
    return (clientY + panel.scrollTop) - (sidebar.offsetTop + element.offsetTop)
  },

  dragDrop () {
    if (this._dragged === this._over) return
    const direction = this.getDirection(this._over)
    this.dropWithDirection(direction)
  },

  getDirection (element) {
    for (const direction of ['top', 'bottom', 'inside']) {
      if (element.classList.contains(`dragdrop-over-${direction}`)) return direction
    }
  },

  dropWithDirection (direction) {
    if (direction) {
      this.insertItem(direction)
    } else {
      this.triggerDragDropEvent('dragdroproot', this._dragged.parentNode)
    }
  },

  insertItem (direction) {
    this.triggerDragDropEvent('dragdropbefore', this._dragged.parentNode, direction)
    const method = (direction === 'top') ? 'insertBefore' : 'insertAfter'
    HelperDOM[method](this._dragged, this._over)
    this.triggerDragDropEvent('dragdropafter', this._dragged.parentNode, direction)
  },

  triggerDragDropEvent (name, container, direction = null) {
    const data = this.prepareTriggerDragDropData(direction)
    const event = new CustomEvent(name, { detail: data, bubbles: true, cancelable: true })
    container.dispatchEvent(event)
  },

  prepareTriggerDragDropData (direction = null) {
    return {
      from: {
        element: this._dragged,
        index: HelperDOM.getElementIndex(this._dragged)
      },
      ...this.addDirectionData(direction)
    }
  },

  addDirectionData (direction) {
    if (!direction) return {}
    const overIndex = HelperDOM.getElementIndex(this._over)
    return {
      to: {
        element: this._over,
        index: (direction === 'top') ? overIndex : overIndex + 1
      },
      direction
    }
  }
}
