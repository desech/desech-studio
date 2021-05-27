import HelperDOM from '../../../../helper/HelperDOM.js'
import HelperElement from '../../../../helper/HelperElement.js'
import HelperStyle from '../../../../helper/HelperStyle.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'

export default {
  getActiveElement (container) {
    return container.querySelector('.animation-element.active')
  },

  setElementData (elem, data) {
    elem.getElementsByClassName('animation-name')[0].textContent = this.getAnimationName(data)
  },

  getAnimationName (data) {
    const value = this.getAnimationType(data)
    const option = this.getAnimationNameOption(value)
    // remove the white space from the select padding
    return option.textContent.replace(/\s\s/gi, '')
  },

  getAnimationNameOption (value) {
    const form = HelperDOM.getTemplate('template-animation-form')
    const select = form.getElementsByClassName('animation-type')[0]
    return select.querySelector(`option[value="${value}"]`)
  },

  getAnimationType (data, elemType = null) {
    elemType = elemType || HelperElement.getType(StateSelectedElement.getElement())
    return HelperStyle.getParsedCSSParam(data, 7) || this.getDefaultFieldValue('type', elemType)
  },

  getDefaultFieldValue (name, elemType) {
    switch (name) {
      case 'duration':
        return '1s'
      case 'delay':
        return '0s'
      case 'iteration':
        return 'infinite'
      case 'direction':
        return 'normal'
      case 'fill':
        return 'none'
      case 'state':
        return 'running'
      case 'type':
        return (elemType === 'text') ? 'tracking-in-expand' : 'scale-up-top'
    }
  }
}
