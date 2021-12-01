import HelperColor from '../../../../helper/HelperColor.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import StyleSheetSelector from '../../../../state/stylesheet/StyleSheetSelector.js'
import StateStyleSheet from '../../../../state/StateStyleSheet.js'

export default {
  getFillValueByStyle (type, style) {
    if (style['border-image-source']) {
      return style['border-image-source']
    } else if (type === 'all') {
      return style['border-top-color'] || ''
    } else {
      return style[`border-${type}-color`] || ''
    }
  },

  getFillValue (type) {
    const selector = StyleSheetSelector.getCurrentSelector()
    return StateStyleSheet.getPropertyValue('border-image-source', selector) ||
      StateStyleSheet.getPropertyValue((type === 'all')
        ? 'border-top-color'
        : `border-${type}-color`, selector)
  },

  setFillValue (preview, background) {
    if (HelperColor.isSolidColor(background)) {
      preview.style.backgroundColor = background
      preview.style.backgroundImage = ''
    } else {
      // gradient, image
      preview.style.backgroundImage = background
      preview.style.backgroundColor = ''
    }
  },

  hideFillContainer (container) {
    const button = container.getElementsByClassName('color-button-main')[0]
    button.classList.remove('active')
    const fill = container.getElementsByClassName('border-fill-container')[0]
    HelperDOM.deleteChildren(fill)
  }
}
