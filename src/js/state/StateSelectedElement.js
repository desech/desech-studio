import HelperElement from '../helper/HelperElement.js'
import HelperCanvas from '../helper/HelperCanvas.js'

export default {
  getRef () {
    const canvas = document.getElementById('canvas')
    return canvas.dataset.selectedElement
  },

  getElement () {
    const ref = this.getRef()
    for (const node of HelperCanvas.getCanvas().getElementsByClassName(ref)) {
      if (HelperElement.isCanvasElement(node)) return node
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
  }
}
