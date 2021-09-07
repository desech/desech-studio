import StateSelectedElement from './StateSelectedElement.js'
import RightCommon from '../main/right/RightCommon.js'
import HelperStyle from '../helper/HelperStyle.js'
import CanvasCommon from '../main/canvas/CanvasCommon.js'
import HelperDOM from '../helper/HelperDOM.js'

export default {
  setStyleValue (property, value) {
    this.setStyles({ [property]: value })
  },

  setStyles (properties) {
    this.addStyles(properties)
    CanvasCommon.hideElementOverlay(Object.keys(properties))
  },

  addStyles (properties) {
    const element = StateSelectedElement.getElement()
    for (const [name, value] of Object.entries(properties)) {
      element.style[name] = value
    }
    // make sure transitions are disabled
    element.style['transition-property'] = 'none'
  },

  applyStyleValue (panelReload = false, ignoreZeroValues = false) {
    const element = StateSelectedElement.getElement()
    const style = HelperStyle.getInlineStyle(element, ignoreZeroValues)
    if (style['transition-property']) delete style['transition-property']
    HelperDOM.clearStyle(element)
    RightCommon.changeStyle(style, panelReload)
  }
}
