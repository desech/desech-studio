import HelperDOM from '../helper/HelperDOM.js'
import ExtendJS from '../helper/ExtendJS.js'

export default {
  getEvents () {
    return {
      mouseover: ['mouseoverEvent']
    }
  },

  mouseoverEvent (event) {
    if (event.target.closest('.tooltip')) {
      this.showTooltip(event.target.closest('.tooltip'))
    } else if (!HelperDOM.isHidden(this.getContainer())) {
      this.hideTooltip()
    }
  },

  showTooltip (element) {
    const direction = this.getDirection(element)
    const pos = this.getPosition(element, direction)
    this.setContainerData(element, direction, pos)
  },

  getDirection (element) {
    for (const direction of ['top', 'bottom', 'left', 'right']) {
      if (element.classList.contains(direction)) return direction
    }
  },

  getPosition (element, direction) {
    const rect = element.getBoundingClientRect()
    const container = this.getContainer()
    HelperDOM.show(container) // we need to show it first, before position it
    return this['getPosition' + ExtendJS.capitalize(direction)](rect, container)
  },

  getContainer () {
    return document.getElementsByClassName('tooltip-container')[0]
  },

  getPositionTop (rect, container) {
    return {
      x: parseInt(rect.left + rect.width / 2) - parseInt(container.offsetWidth / 2),
      y: parseInt(rect.top) - parseInt(container.offsetHeight) - 9
    }
  },

  getPositionBottom (rect, container) {
    return {
      x: parseInt(rect.left + rect.width / 2) - parseInt(container.offsetWidth / 2),
      y: parseInt(rect.top + rect.height) + 9
    }
  },

  getPositionLeft (rect, container) {
    return {
      x: parseInt(rect.left) - parseInt(container.offsetWidth) - 9,
      y: parseInt(rect.top + rect.height / 2) - parseInt(container.offsetHeight / 2)
    }
  },

  getPositionRight (rect, container) {
    return {
      x: parseInt(rect.left + rect.width) + 9,
      y: parseInt(rect.top + rect.height / 2) - parseInt(container.offsetHeight / 2)
    }
  },

  setContainerData (element, direction, pos) {
    const container = this.getContainer()
    container.getElementsByClassName('tooltip-text')[0].textContent = element.dataset.tooltip
    this.setContainerAttributes(container, direction, pos)
  },

  setContainerAttributes (container, direction, pos) {
    container.className = `tooltip-container ${direction}`
    container.style.left = `${pos.x}px`
    container.style.top = `${pos.y}px`
  },

  hideTooltip () {
    HelperDOM.hide(this.getContainer())
  }
}
