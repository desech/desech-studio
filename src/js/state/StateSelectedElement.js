export default {
  getRef () {
    const canvas = document.getElementById('canvas')
    return canvas.dataset.selectedElement
  },

  getElement () {
    const canvas = document.getElementById('canvas')
    const ref = this.getRef()
    return canvas.getElementsByClassName(ref)[0]
  },

  getStyle (element = null) {
    element = element || this.getElement()
    return getComputedStyle(element)
  },

  getComputed (property, style = null) {
    style = style || this.getStyle()
    return style.getPropertyValue(property) || ''
  },

  getComponentProperties (element = null) {
    element = element || this.getElement()
    const data = element.dataset.properties ? JSON.parse(element.dataset.properties) : null
    return data
  }
}
