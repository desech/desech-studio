import HelperDOM from '../../../../helper/HelperDOM.js'
import HelperElement from '../../../../helper/HelperElement.js'
import HelperStyle from '../../../../helper/HelperStyle.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import RightCommon from '../../RightCommon.js'

export default {
  getActiveElement (container) {
    return container.querySelector('.animation-element.active')
  },

  setElementData (elem, data) {
    const name = this.getAnimationName(data)
    if (!name) return
    const node = elem.getElementsByClassName('animation-name')[0]
    node.textContent = name
  },

  getAnimationName (data) {
    const value = this.getAnimationType(data)
    const option = this.getAnimationNameOption(value)
    if (!option) return
    // remove the white space from the select value padding
    return option.textContent.replace(/\s\s/gi, '')
  },

  getAnimationType (data, elemType = null) {
    // sometimes `data` is a string like `scale-up-top` or an object
    // {value: '0s ease 0s 1 normal none running scale-up-top', params: Array(8)}
    const check = data.value || data
    if (RightCommon.isGeneralValue(check)) return check
    elemType = elemType || HelperElement.getType(StateSelectedElement.getElement())
    return HelperStyle.getParsedCSSParam(data, 7) || this.getDefaultFieldValue('type', elemType)
  },

  getAnimationNameOption (value) {
    const form = HelperDOM.getTemplate('template-animation-form')
    const select = form.getElementsByClassName('animation-type')[0]
    return select.querySelector(`option[value="${value}"]`)
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
