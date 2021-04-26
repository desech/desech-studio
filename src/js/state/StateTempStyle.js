import StateSelectedElement from './StateSelectedElement.js'
import RightCommon from '../main/right/RightCommon.js'
import HelperStyle from '../helper/HelperStyle.js'
import CanvasCommon from '../main/canvas/CanvasCommon.js'
import HelperDOM from '../helper/HelperDOM.js'

export default {
  setStyles (properties) {
    const element = StateSelectedElement.getElement()
    for (const [name, value] of Object.entries(properties)) {
      element.style[name] = value
    }
    CanvasCommon.hideElementOverlay(Object.keys(properties))
  },

  setStyleValue (property, value) {
    const element = StateSelectedElement.getElement()
    element.style[property] = value
    CanvasCommon.hideElementOverlay([property])
  },

  applyStyleValue (panelReload = false, ignoreZeroValues = false) {
    const element = StateSelectedElement.getElement()
    const style = HelperStyle.getInlineStyle(element, ignoreZeroValues)
    HelperDOM.clearStyle(element)
    RightCommon.changeStyle(style, panelReload)
  }
}
