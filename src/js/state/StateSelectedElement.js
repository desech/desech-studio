import HelperElement from '../helper/HelperElement.js'
import HelperCanvas from '../helper/HelperCanvas.js'
import LeftCommon from '../main/left/LeftCommon.js'
import HelperTrigger from '../helper/HelperTrigger.js'

export default {
  getRef () {
    const canvas = document.getElementById('canvas')
    return canvas.dataset.selectedElement
  },

  getElement (checkValid = true) {
    const ref = this.getRef()
    for (const node of HelperCanvas.getCanvas().getElementsByClassName(ref)) {
      if (!checkValid || HelperElement.isCanvasElement(node)) {
        return node
      }
    }
  },

  getStyleRef () {
    const element = this.getElement()
    return HelperElement.getStyleRef(element)
  },

  getStyle (element = null) {
    element = element || this.getElement()
    return getComputedStyle(element)
  },

  getComputed (property, style = null) {
    style = style || this.getStyle()
    return style.getPropertyValue(property) || ''
  },

  clearInvalidSelected () {
    const selected = this.getElement(false)
    if ((this.getRef() && !selected) || (selected && !HelperElement.isCanvasElement(selected))) {
      this.deselectElement()
    }
  },

  deselectElement () {
    const selected = HelperCanvas.getCanvas().getElementsByClassName('selected')[0]
    if (selected) selected.classList.remove('selected')
    HelperCanvas.deleteCanvasData('selectedElement')
    this.updateUiAfterElementDeselect()
  },

  updateUiAfterElementDeselect () {
    LeftCommon.deselectItem()
    HelperTrigger.triggerClear('element-overlay')
    HelperTrigger.triggerClear('right-panel-style')
  },

  selectElement (element) {
    const selectedElement = this.getElement()
    if (selectedElement === element) return element
    this.selectElementNode(element)
    return element
  },

  selectElementNode (element) {
    this.deselectElement()
    element.classList.add('selected')
    const ref = HelperElement.getRef(element)
    HelperCanvas.setCanvasData('selectedElement', ref)
    this.updateUiAfterElementSelect(ref)
    this.scrollToItem(element)
  },

  updateUiAfterElementSelect (ref) {
    LeftCommon.selectItemByRef(ref)
    HelperTrigger.triggerReload('element-overlay')
  },

  scrollToItem (element) {
    // doesn't work right, disable it for now
    // const pos = HelperElement.getPosition(element)
    // const container = element.closest('.canvas-container')
    // if (HelperDOM.isInView(pos.leftWithScroll, pos.topWithScroll, container)) return
    // const align = (pos.height < 300) ? 'center' : 'start'
    // element.scrollIntoView({ block: align, inline: align })
  }
}
