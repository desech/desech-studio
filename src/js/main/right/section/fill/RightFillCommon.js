import HelperDOM from '../../../../helper/HelperDOM.js'
import HelperColor from '../../../../helper/HelperColor.js'
import HelperParserBackground from '../../../../helper/parser/HelperParserBackground.js'

export default {
  getActiveElementIndex (container) {
    const elem = this.getActiveElement(container)
    return HelperDOM.getElementIndex(elem)
  },

  getActiveElement (container) {
    return container.querySelector('.fill-element.active')
  },

  setElementData (elem, value) {
    elem.getElementsByClassName('fill-color')[0].style.backgroundImage = value
    elem.getElementsByClassName('fill-name')[0].textContent = this.getElementName(elem, value)
  },

  getElementName (elem, value) {
    const solid = HelperParserBackground.convertBgToColor(value)
    if (HelperColor.isSolidColor(solid)) {
      return this.getBgImageColor(solid)
    } else if (value.includes('linear-gradient(')) {
      return this.getBgImageText(elem, 'linearGradient')
    } else if (value.includes('radial-gradient(')) {
      return this.getBgImageText(elem, 'radialGradient')
    } else { // image
      return this.getBgImageText(elem, 'image')
    }
  },

  getBgImageColor (color) {
    const rgb = HelperColor.extractRgb(color)
    return '#' + HelperColor.rgbToHex(rgb[0], rgb[1], rgb[2])
  },

  getBgImageText (elem, type) {
    return elem.parentNode.dataset[type] // type = linearGradient, radialGradient, image
  }
}
