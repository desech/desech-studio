import HelperElement from '../helper/HelperElement.js'
import HelperCanvas from '../helper/HelperCanvas.js'
import LeftCommon from '../main/left/LeftCommon.js'
import HelperTrigger from '../helper/HelperTrigger.js'
import StateSelectedVariable from './StateSelectedVariable.js'

export default {
  getRef () {
    const data = HelperCanvas.getCanvasData()
    return data?.selectedElement
  },

  getElement (checkValid = true) {
    const ref = this.getRef()
    for (const node of HelperCanvas.getCanvas().getElementsByClassName(ref)) {
      if (!checkValid || HelperElement.isCanvasElement(node)) {
        return node
      }
    }
  },

  getStyleRef () {
    const element = this.getElement()
    return HelperElement.getStyleRef(element)
  },

  getComputedStyle (element = null) {
    element = element || this.getElement()
    return getComputedStyle(element)
  },

  getComputed (property, style = null) {
    style = style || this.getComputedStyle()
    return style.getPropertyValue(property) || ''
  },

  clearInvalidSelected () {
    const selected = this.getElement(false)
    if ((this.getRef() && !selected) || (selected && !HelperElement.isCanvasElement(selected))) {
      this.deselectElement()
    }
  },

  deselectElement (clear = true) {
    const selected = HelperCanvas.getCanvas().getElementsByClassName('selected')[0]
    if (selected) selected.classList.remove('selected')
    HelperCanvas.deleteCanvasData('selectedElement')
    LeftCommon.deselectItem('element')
    if (clear) this.updateUiAfterElementDeselect()
  },

  updateUiAfterElementDeselect () {
    HelperTrigger.triggerClear('element-overlay')
    HelperTrigger.triggerClear('right-panel')
  },

  selectElement (element) {
    const selectedElement = this.getElement()
    if (selectedElement === element) return element
    this.selectElementNode(element)
    return element
  },

  selectElementNode (element) {
    // don't clear the containers, because there's a race condition with the select reload
    this.deselectElement(false)
    element.classList.add('selected')
    const ref = HelperElement.getRef(element)
    HelperCanvas.setCanvasData('selectedElement', ref)
    this.updateUiAfterElementSelect(ref)
    this.scrollToItem(element)
  },

  updateUiAfterElementSelect (ref) {
    LeftCommon.selectItemByRef(ref)
    // clear the selected variable, so we can see the new selected item; don't reload the panel
    StateSelectedVariable.deselectVariable(false)
    HelperTrigger.triggerReload('element-overlay', { panelReload: true })
  },

  scrollToItem (element) {
    // doesn't work right, disable it for now
    // const pos = HelperElement.getPosition(element)
    // const container = element.closest('.canvas-container')
    // if (HelperDOM.isInView(pos.leftWithScroll, pos.topWithScroll, container)) return
    // const align = (pos.height < 300) ? 'center' : 'start'
    // element.scrollIntoView({ block: align, inline: align })
  }
}
