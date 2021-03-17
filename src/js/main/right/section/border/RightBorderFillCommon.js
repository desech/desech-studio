import HelperColor from '../../../../helper/HelperColor.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import StyleSheetSelector from '../../../../state/stylesheet/StyleSheetSelector.js'
import StateStyleSheet from '../../../../state/StateStyleSheet.js'

export default {
  getFillValue (type) {
    const selector = StyleSheetSelector.getCurrentSelector()
    return StateStyleSheet.getPropertyValue('border-image-source', selector) || StateStyleSheet.getPropertyValue((type === 'all') ? 'border-top-color' : `border-${type}-color`, selector)
  },

  setFillValue (preview, background) {
    if (HelperColor.isSolidColor(background)) {
      preview.style.backgroundColor = background
      preview.style.backgroundImage = ''
    } else { // gradient, image
      preview.style.backgroundImage = background
      preview.style.backgroundColor = ''
    }
  },

  hideFillContainer (container, button = null) {
    this.deselectButton(container, button)
    const fill = container.getElementsByClassName('border-fill-container')[0]
    HelperDOM.deleteChildren(fill)
  },

  deselectButton (container, button) {
    if (button) {
      button.classList.remove('active')
    } else {
      const activeButton = container.querySelector('.border-fill-button .active')
      if (activeButton) activeButton.classList.remove('active')
    }
  }
}
