import StateSelectedElement from '../../../state/StateSelectedElement.js'
import CanvasElement from '../CanvasElement.js'
import CanvasElementCreate from './CanvasElementCreate.js'
import HelperDOM from '../../../helper/HelperDOM.js'
import CanvasCommon from '../CanvasCommon.js'
import HelperElement from '../../../helper/HelperElement.js'
import HelperTrigger from '../../../helper/HelperTrigger.js'
import StyleSheetSelector from '../../../state/stylesheet/StyleSheetSelector.js'
import StateStyleSheet from '../../../state/StateStyleSheet.js'
import StateCommand from '../../../state/StateCommand.js'
import RightCommon from '../../right/RightCommon.js'
import ExtendJS from '../../../helper/ExtendJS.js'
import StyleSheetProperties from '../../../state/stylesheet/StyleSheetProperties.js'
import HelperComponent from '../../../helper/HelperComponent.js'
import HelperStyle from '../../../helper/HelperStyle.js'
import Crypto from '../../../../electron/lib/Crypto.js'

export default {
  async deleteElement () {
    const ref = StateSelectedElement.getRef()
    const element = StateSelectedElement.getElement()
    if (!this.isElementAllowed(ref) || !HelperComponent.isMovableElement(element)) {
      return
    }
    StateSelectedElement.deselectElement() // this first, before operation
    await CanvasElement.addRemoveElementCommand(ref, 'removeElement', 'addElement')
  },

  async copyElement () {
    const ref = StateSelectedElement.getRef()
    if (!this.isElementAllowed(ref)) return
    const element = HelperElement.getElement(ref)
    await this.copyElementData(element)
  },

  async cutElement () {
    const ref = StateSelectedElement.getRef()
    const element = StateSelectedElement.getElement()
    if (!this.isElementAllowed(ref) || !HelperComponent.isMovableElement(element)) {
      return
    }
    CanvasElement.removeHidden(element)
    const token = Crypto.generateSmallID()
    CanvasElement.appendToken(element, token)
    await this.copyElementData(element, 'cut')
    StateSelectedElement.deselectElement() // this first, before operation
    await CanvasElement.tokenCommand(token, 'cutElement')
  },

  async pasteElement () {
    const data = await this.getPastedData()
    if (!data.element) return
    const newElement = this.createElementFromData(data.element)
    if (!this.addPastedPlacement()) return
    this.addPastedElement(newElement)
    await this.pasteExecute(newElement, data.element)
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'element' })
  },

  async duplicateElement (element = null) {
    element ? await this.copyElementData(element) : await this.copyElement()
    const data = await this.getPastedData()
    if (!data.element) return
    await this.pasteDuplicateElement(data)
  },

  async pasteDuplicateElement (data) {
    const newElement = this.createElementFromData(data.element)
    if (!this.addPastedPlacement('bottom')) return
    this.addPastedElement(newElement)
    const ref = HelperElement.getRef(newElement)
    await CanvasElement.addRemoveElementCommand(ref, 'duplicateElement', 'removeElement', false)
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'element' })
    StateSelectedElement.selectElement(newElement)
  },

  isElementAllowed (ref) {
    if (!ref) return false
    const type = HelperElement.getTypeByRef(ref)
    return (type !== 'body' && type !== 'inline')
  },

  async copyElementData (element, action = 'copy') {
    const tag = HelperDOM.getTag(element)
    const attributes = this.getCopiedAttributes(element, action)
    const html = element.innerHTML
    const refs = this.getAllReplaceableRefs(element.outerHTML)
    const style = this.getStyleByRefs(refs)
    await this.saveToClipboard({ element: { action, tag, attributes, html, refs, style } })
  },

  getCopiedAttributes (element, action) {
    const filter = (action === 'copy') ? { attr: true, cls: false } : { attr: false, cls: false }
    const attrs = this.getAttributesList(element, filter)
    if (action === 'cut') attrs['data-ss-token'] = Crypto.generateSmallID()
    return attrs
  },

  // all these refs will be replaced on paste by generateNewRefs()
  getAllReplaceableRefs (html) {
    const allRefs = []
    for (const classes of html.matchAll(/class="(.*?)"/g)) {
      if (!classes) continue
      const refs = HelperElement.getAllRefsObject(classes[1].split(' '))
      if (refs.position) allRefs.push(refs.position)
      if (refs.component) allRefs.push(refs.component)
    }
    return allRefs
  },

  // when copying components, we will have here the position refs which have no style
  // the component ref might have some override style
  getStyleByRefs (refs) {
    let style = {}
    for (const ref of refs) {
      const element = HelperElement.getElement(ref)
      const elementStyle = this.getStyle(element, ref)
      style = { ...style, ...elementStyle }
    }
    return style
  },

  getStyle (element, ref = null) {
    const style = {}
    const selectors = StyleSheetSelector.getElementSelectors(element, 'ref', ref)
    for (const selector of selectors) {
      const css = StateStyleSheet.getSelectorStyle(selector)
      if (css.length) style[selector] = css
    }
    return style
  },

  async saveToClipboard (data) {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
  },

  async clearClipboard () {
    await navigator.clipboard.writeText('')
  },

  createElementFromData (data) {
    const refMap = (data.action === 'cut') ? null : this.generateNewRefs(data.refs)
    const node = HelperDOM.createElement(data.tag, document)
    for (let [name, value] of Object.entries(data.attributes)) {
      if (name.startsWith('xmlns')) continue
      if (name === 'class') value = value.replace('selected', '').trim()
      node.setAttributeNS(null, name, this.replaceMapValue(value, refMap))
    }
    node.innerHTML = this.replaceMapValue(data.html, refMap)
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
    if (!HelperElement.isHidden(element)) {
      HelperDOM.show(element)
    }
  },

  async pasteExecute (element, data) {
    if (data.action === 'copy') {
      const ref = HelperElement.getRef(element)
      await CanvasElement.addRemoveElementCommand(ref, 'pasteElement', 'removeElement', false)
    } else { // cut
      const token = data.attributes['data-ss-token']
      await CanvasElement.tokenCommand(token, 'pasteCutElement', false)
      this.clearClipboard()
    }
  },

  async copyAll () {
    const element = StateSelectedElement.getElement()
    const type = HelperElement.getType(element)
    const data = {
      attributes: this.getAttributes(element, type),
      style: this.getStyle(element)
    }
    await this.saveToClipboard(data)
  },

  async copyAttributes () {
    const element = StateSelectedElement.getElement()
    const type = HelperElement.getType(element)
    const attributes = this.getAttributes(element, type)
    await this.saveToClipboard({ attributes })
  },

  async copyStyle () {
    const element = StateSelectedElement.getElement()
    const style = this.getStyle(element)
    await this.saveToClipboard({ style })
  },

  getAttributes (element, type, filter = { attr: true, cls: true }) {
    return {
      type,
      filter,
      attributes: this.getAttributesList(element, filter),
      content: this.getContent(element, type)
    }
  },

  getAttributesList (element, filter) {
    const ignored = this.getCopyIgnoredAttributes(element)
    const attributes = {}
    for (const attr of element.attributes) {
      if (!filter.attr || !ignored.includes(attr.name)) {
        attributes[attr.name] = this.getAttributeValue(attr, filter.cls)
      }
    }
    return attributes
  },

  // check RightHtmlCommon.getIgnoredAttributes()
  // this is used when we copy attributes from elements
  getCopyIgnoredAttributes (element) {
    const attrs = ['style', 'data-ss-token']
    // we don't want to copy the hole attr when it belongs to the main component, because only
    // one hole is allowed, but we do allow it when it's part of some other component
    if (!HelperComponent.isComponent(element) && !HelperComponent.isComponentElement(element)) {
      attrs.push('data-ss-component-hole')
    }
    return attrs
  },

  getAttributeValue (attr, filterCls) {
    if (attr.name !== 'class') return attr.value
    if (filterCls) {
      return this.removeNonComponentClasses(attr.value)
    } else {
      return attr.value.replace(' selected', '').replace(' component-element', '').trim()
    }
  },

  removeNonComponentClasses (string) {
    const classes = string.trim().split(' ')
    for (let i = classes.length - 1; i >= 0; i--) {
      if (!classes[i] || !HelperStyle.isComponentClass(classes[i])) {
        classes.splice(i, 1)
      }
    }
    return classes.join(' ')
  },

  getContent (element, type) {
    if (['icon', 'video', 'audio', 'dropdown'].includes(type)) {
      return element.innerHTML
    }
  },

  // paste all attributes and styles
  async pasteAll () {
    const ref = StateSelectedElement.getRef()
    // we can only paste inside elements
    if (!ref) return
    const data = await this.getPastedData()
    if (!data.attributes && !data.style) return
    await this.pasteAllCommand(ref, data)
    HelperTrigger.triggerReload('right-panel')
  },

  async getPastedData () {
    const string = await navigator.clipboard.readText()
    return string ? ExtendJS.parseJsonNoError(string) : {}
  },

  async pasteAllCommand (ref, data, execute = true) {
    const command = {
      do: {
        command: 'pasteElementData',
        ref,
        data
      },
      undo: {
        command: 'pasteElementData',
        ref,
        data: this.getCurrentData(ref, data)
      }
    }
    StateCommand.stackCommand(command)
    if (execute) await StateCommand.executeCommand(command.do)
  },

  getCurrentData (ref, pastedData) {
    const element = HelperElement.getElement(ref)
    const type = HelperElement.getType(element)
    const data = {}
    if (pastedData.attributes) {
      data.attributes = this.getAttributes(element, type, { attr: false, cls: false })
    }
    if (pastedData.style) data.style = this.getStyle(element)
    return data
  },

  async copySelector () {
    const selector = StyleSheetSelector.getCurrentSelector()
    if (!selector) return null
    const properties = StateStyleSheet.getSelectorStyleProperties(selector)
    await this.saveToClipboard({ selector: { selector, properties } })
    return properties
  },

  async cutSelector () {
    const properties = await this.copySelector()
    if (!properties) return
    const empty = StyleSheetProperties.getEmptyProperties(properties)
    await RightCommon.changeStyle(empty, true, 'cutStyle')
  },

  async pasteSelector () {
    const ref = StateSelectedElement.getRef()
    // we can only paste inside elements
    if (!ref) return
    const data = await this.getPastedData()
    if (!data.selector) return
    const properties = this.joinProperties(data.selector.properties)
    await RightCommon.changeStyle(properties, true, 'pasteStyle')
  },

  joinProperties (pastedProperties) {
    const selector = StyleSheetSelector.getCurrentSelector()
    const currentProperties = StateStyleSheet.getSelectorStyleProperties(selector)
    const empty = StyleSheetProperties.getEmptyProperties(currentProperties)
    return { ...empty, ...pastedProperties }
  }
}
