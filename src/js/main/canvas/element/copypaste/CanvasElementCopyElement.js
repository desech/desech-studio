import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import CanvasElement from '../../CanvasElement.js'
import CanvasElementCreate from './../CanvasElementCreate.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import CanvasCommon from '../../CanvasCommon.js'
import HelperElement from '../../../../helper/HelperElement.js'
import HelperTrigger from '../../../../helper/HelperTrigger.js'
import StateStyleSheet from '../../../../state/StateStyleSheet.js'
import HelperComponent from '../../../../helper/HelperComponent.js'
import Crypto from '../../../../../electron/lib/Crypto.js'
import HelperClipboard from '../../../../helper/HelperClipboard.js'
import CanvasElementCopyCommon from './CanvasElementCopyCommon.js'

export default {
  async deleteElement () {
    const element = StateSelectedElement.getElement()
    if (!this.isElementAllowed(element)) return
    const ref = StateSelectedElement.getRef()
    // deselect first, before operation
    StateSelectedElement.deselectElement()
    await CanvasElement.addRemoveElementCommand(ref, 'removeElement', 'addElement')
  },

  async copyElement () {
    const element = StateSelectedElement.getElement()
    if (!this.isElementAllowed(element)) return
    await this.copyElementData(element)
  },

  async cutElement () {
    const element = StateSelectedElement.getElement()
    if (!this.isElementAllowed(element)) return
    const token = Crypto.generateSmallID()
    CanvasElement.appendToken(element, token)
    await this.copyElementData(element, 'cut')
    // deselect first, before operation
    StateSelectedElement.deselectElement()
    await CanvasElement.tokenCommand(token, 'cutElement')
  },

  async pasteElement () {
    const data = await HelperClipboard.getData()
    if (!data.element) return
    const newElement = this.createElementFromData(data.element)
    if (!this.addPastedPlacement()) return
    this.addPastedElement(newElement)
    await this.pasteExecute(newElement, data.element)
    HelperTrigger.triggerReload('sidebar-left-panel', { panels: ['element'] })
  },

  async duplicateElement (element = null) {
    element ? await this.copyElementData(element) : await this.copyElement()
    const data = await HelperClipboard.getData()
    if (!data.element) return
    await this.pasteDuplicateElement(data)
  },

  isElementAllowed (element) {
    if (!element) return false
    const type = HelperElement.getType(element)
    return (type !== 'body' && type !== 'inline' && HelperComponent.isMovableElement(element))
  },

  async copyElementData (element, action = 'copy') {
    // don't allow certain nodes
    if (this.unallowedNodes().includes(HelperDOM.getTag(element))) {
      throw new Error('You can\'t copy/paste/duplicate this element type. ' +
        'Change its tag to a <div> or <p>, then copy/paste it and then change the tag back.')
    }
    const clone = element.cloneNode(true)
    this.processMoveToken(clone, action)
    const html = clone.outerHTML
    const refs = this.getAllReplaceableRefs(html)
    const style = this.getStyleByRefs(refs, false)
    await HelperClipboard.saveData({ element: { action, html, refs, style } })
  },

  unallowedNodes () {
    return ['thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption', 'colgroup', 'col']
  },

  processMoveToken (element, action) {
    if (action === 'copy') {
      element.removeAttributeNS(null, 'data-ss-token')
    } else { // cut
      element.setAttributeNS(null, 'data-ss-token', Crypto.generateSmallID())
    }
  },

  // all these refs will be replaced on paste by generateNewRefs()
  getAllReplaceableRefs (html) {
    const allRefs = []
    for (const match of html.matchAll(/class="(.*?)"/g)) {
      if (!match) continue
      const refs = HelperElement.getAllRefsObject(match[1].split(' '))
      if (refs?.position) allRefs.push(refs.position)
      if (refs?.component) allRefs.push(refs.component)
    }
    return allRefs
  },

  // when copying components, we will have here the position refs which have no style
  // the component ref might have some override style
  getStyleByRefs (refs, clean = true) {
    let style = {}
    for (const ref of refs) {
      const element = HelperElement.getElement(ref)
      const elementStyle = CanvasElementCopyCommon.getStyle(element, clean)
      style = { ...style, ...elementStyle }
    }
    return style
  },

  createElementFromData (data) {
    const refMap = (data.action === 'cut') ? null : this.generateNewRefs(data.refs)
    const html = this.replaceMapValue(data.html, refMap)
    const node = document.createRange().createContextualFragment(html).children[0]
    this.createElementStyle(data.style, refMap)
    return node
  },

  generateNewRefs (refs) {
    const map = {}
    for (const ref of refs) {
      map[ref] = HelperElement.generateElementRef()
    }
    return map
  },

  replaceMapValue (value, map) {
    return map ? value.replace(/e0[a-z0-9]+/g, match => map[match] || match) : value
  },

  createElementStyle (style, refMap) {
    for (const [tmpSelector, rules] of Object.entries(style)) {
      const selector = this.replaceMapValue(tmpSelector, refMap)
      StateStyleSheet.addSelector(selector, rules)
    }
  },

  addPastedPlacement (placement = null) {
    const element = StateSelectedElement.getElement()
    if (!HelperElement.isCanvasElement(element) || HelperElement.getType(element) === 'inline' ||
      (!HelperComponent.isMovableElement(element) && (!HelperComponent.isComponentHole(element) ||
      HelperComponent.isComponentElement(element)))) {
      return false
    }
    if (placement) {
      element.classList.add('placement', placement)
    } else {
      this.addGeneralPastedPlacement(element)
    }
    return true
  },

  // check CanvasElementCreate.addCanvasElementMarker()
  addGeneralPastedPlacement (element) {
    const isComponent = HelperComponent.isComponent(element)
    const hole = HelperComponent.getInstanceHole(element)
    if (isComponent && hole) {
      hole.classList.add('placement', 'inside')
    } else if (HelperElement.isContainer(element) && !isComponent &&
      (!HelperComponent.isComponentHole(element) || element.closest('[data-ss-component]'))) {
      element.classList.add('placement', 'inside')
    } else {
      element.classList.add('placement', 'bottom')
    }
  },

  addPastedElement (element) {
    CanvasElementCreate.createElementForPlacement(element)
    CanvasCommon.removePlacementMarker()
    // when we paste an element, we make it visible for feedback to see what happened
    if (!HelperDOM.isHidden(element)) {
      HelperDOM.show(element)
    }
  },

  async pasteExecute (element, data) {
    if (data.action === 'copy') {
      const ref = HelperElement.getRef(element)
      await CanvasElement.addRemoveElementCommand(ref, 'pasteElement', 'removeElement', false)
    } else { // cut
      const token = element.getAttributeNS(null, 'data-ss-token')
      await CanvasElement.tokenCommand(token, 'pasteCutElement', false)
      await HelperClipboard.clear()
    }
  },

  async pasteDuplicateElement (data) {
    const newElement = this.createElementFromData(data.element)
    if (!this.addPastedPlacement('bottom')) return
    this.addPastedElement(newElement)
    const ref = HelperElement.getRef(newElement)
    await CanvasElement.addRemoveElementCommand(ref, 'duplicateElement', 'removeElement', false)
    HelperTrigger.triggerReload('sidebar-left-panel', { panels: ['element'] })
    StateSelectedElement.selectElement(newElement)
  }
}
