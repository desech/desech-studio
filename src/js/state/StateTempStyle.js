import StateSelectedElement from './StateSelectedElement.js'
import RightCommon from '../main/right/RightCommon.js'
import HelperStyle from '../helper/HelperStyle.js'
import CanvasCommon from '../main/canvas/CanvasCommon.js'

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
    element.removeAttributeNS(null, 'style')
    RightCommon.changeStyle(style, panelReload)
  }
}
