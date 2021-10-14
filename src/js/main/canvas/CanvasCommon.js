import HelperCanvas from '../../helper/HelperCanvas.js'
import HelperDOM from '../../helper/HelperDOM.js'
import ExtendJS from '../../helper/ExtendJS.js'

export default {
  _overlayTimer: null,

  enablePanelButton (type) {
    this.activatePanelButton(type)
    if (!HelperCanvas.isCreateTool()) this.removePlacementMarker()
    HelperCanvas.setCanvasData('tool', type)
  },

  activatePanelButton (type) {
    document.querySelector('.tool-button.selected').classList.remove('selected')
    const button = document.querySelector(`.tool-button[data-type="${type}"]`)
    button.classList.add('selected')
    this.hideSiblingButtons(button)
  },

  hideSiblingButtons (button) {
    if (HelperDOM.isVisible(button)) return
    HelperDOM.hide(button.parentNode.children)
    HelperDOM.show(button)
  },

  removePlacementMarker () {
    const element = HelperCanvas.getCanvas().getElementsByClassName('placement')[0]
    if (element) element.classList.remove('placement', 'top', 'bottom', 'inside')
  },

  hideElementOverlay (properties) {
    if (!this.checkPropertiesForHideOverlay(properties)) return
    const overlay = document.getElementById('element-overlay')
    HelperDOM.hide(overlay)
    if (this._overlayTimer) clearTimeout(this._overlayTimer)
    this._overlayTimer = setTimeout(() => {
      HelperDOM.show(overlay)
    }, 2000)
  },

  checkPropertiesForHideOverlay (properties) {
    const ignore = [
      'width',
      'height',
      'margin',
      'margin-top',
      'margin-bottom',
      'margin-left',
      'margin-right',
      'padding',
      'padding-top',
      'padding-bottom',
      'padding-left',
      'padding-right',
      'grid-template-rows',
      'grid-template-columns',
      'column-gap',
      'row-gap',
      'justify-items',
      'justify-content',
      'align-items',
      'align-content'
    ]
    const intersect = ExtendJS.arrayIntersect(properties, ignore)
    // it's ok when the intersection is empty
    return !intersect.length
  },

  getClosestElementOrComponentOrHole (node) {
    return node.closest('.element:not(.component-element), ' +
      '[data-ss-component]:not(.component-element), ' +
      '[data-ss-component-hole]:not(.component-element)')
  },

  getClosestElementOrComponent (node) {
    return node.closest('.element:not(.component-element), ' +
      '[data-ss-component]:not(.component-element)')
  }
}
