import StateSelectedElement from '../../../state/StateSelectedElement.js'
import CanvasElement from '../CanvasElement.js'
import CanvasElementSelect from './CanvasElementSelect.js'
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
import HelperCrypto from '../../../helper/HelperCrypto.js'
import HelperComponent from '../../../helper/HelperComponent.js'
import HelperStyle from '../../../helper/HelperStyle.js'

export default {
  async deleteElement () {
    const ref = StateSelectedElement.getRef()
    const element = StateSelectedElement.getElement()
    if (!this.isElementAllowed(ref) || !HelperComponent.isMovableElement(element)) {
      return
    }
    CanvasElementSelect.deselectElement() // this first, before operation
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
    const token = HelperCrypto.generateSmallHash()
    CanvasElement.appendToken(element, token)
    await this.copyElementData(element, 'cut')
    CanvasElementSelect.deselectElement() // this first, before operation
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
    CanvasElementSelect.selectElement(newElement)
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
    // all these refs will be replaced on paste by generateNewRefs()
    const refs = this.getAllRefs(element.outerHTML)
    const style = this.getAllRefsStyle(refs)
    await this.saveToClipboard({ element: { action, tag, attributes, html, refs, style } })
  },

  getCopiedAttributes (element, action) {
    const filter = (action === 'copy') ? { attr: true, cls: false } : { attr: false, cls: false }
    const attrs = this.getAttributesList(element, filter)
    if (action === 'cut') attrs['data-ss-token'] = HelperCrypto.generateSmallHash()
    this.processComponentAttribute(element, attrs, action)
    return attrs
  },

  processComponentAttribute (element, attrs, action) {
    // on copy regenerate the component ref
    if (action === 'copy' && HelperComponent.isComponent(element)) {
      const data = HelperComponent.getComponentData(element)
      data.ref = HelperElement.generateElementRef()
      attrs['data-ss-component'] = JSON.stringify(data)
    }
  },

  getAllRefs (html) {
    const refs = []
    const matches = html.matchAll(/class="(.*?)"/g)
    for (const match of matches) {
      const ref = match[1].match(/e0[a-z0-9]+/g)
      if (!ref) continue
      refs.push(ref[0])
    }
    return refs
  },

  getAllRefsStyle (refs) {
    let style = {}
    for (const ref of refs) {
      const element = HelperElement.getElement(ref)
      const elementStyle = this.getStyle(element)
      style = { ...style, ...elementStyle }
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
      !HelperComponent.isMovableElement(element)) {
      return false
    }
    if (placement) {
      element.classList.add('placement', placement)
    } else {
      this.addGeneralPastedPlacement(element)
    }
    return true
  },

  addGeneralPastedPlacement (element) {
    const isComponent = HelperComponent.isComponent(element)
    const hole = HelperComponent.getInstanceHole(element)
    if (isComponent && hole) {
      hole.classList.add('placement', 'inside')
    } else if (HelperElement.isContainer(element) && !isComponent) {
      element.classList.add('placement', 'inside')
    } else {
      element.classList.add('placement', 'bottom')
    }
  },

  addPastedElement (element) {
    CanvasElementCreate.createElementForPlacement(element)
    CanvasCommon.removePlacementMarker()
    if (!HelperElement.isHidden(element)) HelperDOM.show(element)
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
    const attributes = {}
    for (const attr of element.attributes) {
      if (!filter.attr || !this.getCopyIgnoredAttributes().includes(attr.name)) {
        attributes[attr.name] = this.getAttributeValue(attr, filter.cls)
      }
    }
    return attributes
  },

  // check RightHtmlCommon.getIgnoredAttributes()
  getCopyIgnoredAttributes () {
    return ['style', 'data-ss-token', 'data-ss-component', 'data-ss-component-hole']
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

  getStyle (element) {
    const style = {}
    const selectors = StyleSheetSelector.getElementSelectors(element, 'ref')
    for (const selector of selectors) {
      const css = StateStyleSheet.getSelectorStyle(selector)
      if (css.length) style[selector] = css
    }
    return style
  },

  // paste all attributes and styles
  async pasteAll () {
    const ref = StateSelectedElement.getRef()
    // we can only paste inside elements
    if (!ref) return
    const data = await this.getPastedData()
    if (!data.attributes && !data.style) return
    await this.pasteAllCommand(ref, data)
    HelperTrigger.triggerReload('right-panel-style')
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
