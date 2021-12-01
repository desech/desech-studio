import HelperDOM from '../../helper/HelperDOM.js'
import CanvasOverlayResize from './overlay/CanvasOverlayResize.js'
import StateSelectedElement from '../../state/StateSelectedElement.js'
import HelperEvent from '../../helper/HelperEvent.js'
import CanvasOverlayCommon from './overlay/CanvasOverlayCommon.js'
import ExtendJS from '../../helper/ExtendJS.js'
import CanvasOverlayGrid from './overlay/CanvasOverlayGrid.js'
import HelperCanvas from '../../helper/HelperCanvas.js'
import HelperElement from '../../helper/HelperElement.js'
import HelperTrigger from '../../helper/HelperTrigger.js'

export default {
  // needed because resize events are triggered more than once
  _resizeTimer: null,
  _repositionTimer: null,

  getEvents () {
    return {
      reloadcontainer: ['reloadcontainerEvent'],
      clearcontainer: ['clearcontainerEvent'],
      resize: ['resizeWindowEvent'],
      wheel: ['wheelPositionElementOverlayEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  reloadcontainerEvent (event) {
    if (event.target.id === 'element-overlay') {
      this.reloadOverlay(event.detail ? event.detail.panelReload : null)
    }
  },

  clearcontainerEvent (event) {
    if (event.target.id === 'element-overlay') {
      this.clearOverlay()
    }
  },

  resizeWindowEvent (event) {
    clearTimeout(this._resizeTimer)
    this._resizeTimer = setTimeout(() => {
      this.reloadOverlay()
    }, 100)
  },

  wheelPositionElementOverlayEvent (event) {
    if (event.target.closest('#canvas') && StateSelectedElement.getRef()) {
      this.positionElementOverlay()
    }
  },

  reloadOverlay (panelReload = true) {
    if (!this.getOverlay()) return
    this.clearOverlay(panelReload)
    this.loadOverlay(panelReload)
  },

  clearOverlay () {
    HelperDOM.deleteChildren(this.getOverlay())
  },

  loadOverlay (panelReload = true) {
    const element = StateSelectedElement.getElement()
    if (!HelperElement.isCanvasElement(element)) return
    this.injectOverlay()
    if (panelReload !== false) HelperTrigger.triggerReload('right-panel')
  },

  injectOverlay () {
    this.addOverlay()
    CanvasOverlayCommon.positionOverlay()
    this.marginPaddingOverlay()
    this.setOverlayType()
    CanvasOverlayGrid.setOverlayMode(this.getOverlay().dataset.mode)
  },

  addOverlay () {
    const template = HelperDOM.getTemplate('template-element-overlay')
    HelperDOM.replaceOnlyChild(this.getOverlay(), template)
  },

  getOverlay () {
    return document.getElementById('element-overlay')
  },

  marginPaddingOverlay () {
    const style = StateSelectedElement.getComputedStyle()
    for (const type of ['margin', 'padding']) {
      this.marginPaddingDirection(style, type)
    }
  },

  marginPaddingDirection (style, type) {
    const container = this.getOverlay().getElementsByClassName(`resize-${type}`)[0]
    for (const direction of ['left', 'right', 'top', 'bottom']) {
      this.setButton(container, style, type, direction)
    }
  },

  setButton (container, style, type, direction) {
    const button = container.getElementsByClassName(`resize-${direction}`)[0]
    let value = parseInt(style[type + ExtendJS.capitalize(direction)])
    // don't allow negative margin/padding
    value = value < 0 ? 0 : value
    const obj = CanvasOverlayResize.getTypeClass(type)
    const visualValue = obj.calculate(CanvasOverlayCommon.getVisualValue(value))
    obj['set' + ExtendJS.capitalize(direction)](button, visualValue)
  },

  getOverlayContainer () {
    return document.getElementsByClassName('element-overlay-container')[0]
  },

  setOverlayType () {
    const container = this.getOverlayContainer()
    const element = StateSelectedElement.getElement()
    this.setOverlaySmall(container, element)
    this.setOverlayContainer(container, element)
    container.dataset.type = HelperElement.getType(element)
  },

  setOverlaySmall (container, element) {
    HelperElement.hasSmallWidth(element)
      ? container.classList.add('small-width')
      : container.classList.remove('small-width')
    HelperElement.hasSmallHeight(element)
      ? container.classList.add('small-height')
      : container.classList.remove('small-height')
  },

  setOverlayContainer (container, element) {
    HelperElement.isContainer(element)
      ? container.classList.add('container')
      : container.classList.remove('container')
  },

  setOverlayEditing () {
    const container = this.getOverlayContainer()
    HelperCanvas.getOperation() === 'editing'
      ? container.classList.add('editing')
      : container.classList.remove('editing')
  },

  positionElementOverlay () {
    const overlay = this.getOverlay()
    HelperDOM.hide(overlay)
    if (this._repositionTimer) clearTimeout(this._repositionTimer)
    this._repositionTimer = setTimeout(() => {
      CanvasOverlayCommon.positionOverlay()
      HelperDOM.show(overlay)
    }, 500)
  }
}
