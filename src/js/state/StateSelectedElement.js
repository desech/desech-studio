import HelperElement from '../helper/HelperElement.js'
import HelperCanvas from '../helper/HelperCanvas.js'

export default {
  getRef () {
    const canvas = document.getElementById('canvas')
    return canvas.dataset.selectedElement
  },

  getElement () {
    const canvas = HelperCanvas.getCanvas()
    const ref = this.getRef()
    for (const node of canvas.getElementsByClassName(ref)) {
      if (HelperElement.isCanvasElement(node)) return node
    }
  },

  getStyle (element = null) {
    element = element || this.getElement()
    return getComputedStyle(element)
  },

  getComputed (property, style = null) {
    style = style || this.getStyle()
    return style.getPropertyValue(property) || ''
  },

  getElementProperties (element = null) {
    element = element || this.getElement()
    const props = element.dataset.elementProperties
    return props ? JSON.parse(props) : null
  }
}
