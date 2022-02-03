import HelperDOM from '../../../../helper/HelperDOM.js'
import HelperColor from '../../../../helper/HelperColor.js'
import HelperParserBackground from '../../../../helper/parser/HelperParserBackground.js'
import RightCommon from '../../RightCommon.js'
import HelperTranslate from '../../../../helper/HelperTranslate.js'

export default {
  getActiveElementIndex (container) {
    const elem = this.getActiveElement(container)
    return HelperDOM.getElementIndex(elem)
  },

  getActiveElement (container) {
    return container.querySelector('.fill-element.active')
  },

  insertElement (list, value = '') {
    const template = HelperDOM.getTemplate('template-fill-element')
    list.appendChild(template)
    if (value) this.setElementData(template, value)
    return template
  },

  setElementData (elem, value) {
    elem.getElementsByClassName('fill-name')[0].textContent = this.getElementName(value)
    const color = elem.getElementsByClassName('fill-color')[0]
    if (RightCommon.isGeneralValue(value)) {
      color.parentNode.style.display = 'none'
    } else {
      color.style.backgroundImage = value
    }
  },

  getElementName (value) {
    const words = HelperTranslate.getWords()
    if (RightCommon.isGeneralValue(value)) return words[value]
    const solid = HelperParserBackground.convertBgToColor(value)
    if (HelperColor.isSolidColor(solid)) {
      return this.getBgImageColor(solid)
    } else if (value.includes('linear-gradient(')) {
      return words['linear-gradient']
    } else if (value.includes('radial-gradient(')) {
      return words['radial-gradient']
    } else { // image
      return words.image
    }
  },

  getBgImageColor (color) {
    const rgb = HelperColor.extractRgb(color)
    return '#' + HelperColor.rgbToHex(rgb[0], rgb[1], rgb[2])
  },

  getAllBlankProperties () {
    const properties = {}
    const props = ['image', 'size', 'position', 'repeat', 'attachment', 'origin', 'blend-mode']
    for (const property of props) {
      properties['background-' + property] = ''
    }
    return properties
  }
}
