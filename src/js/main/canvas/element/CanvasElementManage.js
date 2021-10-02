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

export default {
  deleteElement () {
    const ref = StateSelectedElement.getRef()
    if (!this.isElementAllowed(ref)) return
    CanvasElement.addRemoveElementCommand(ref, 'removeElement', 'addElement')
    CanvasElementSelect.deselectElement()
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'element' })
  },

  isElementAllowed (ref) {
    if (!ref) return false
    const type = HelperElement.getTypeByRef(ref)
    return (type !== 'body' && type !== 'inline')
  },

  async copyElement () {
    const ref = StateSelectedElement.getRef()
    if (!this.isElementAllowed(ref)) return
    await this.copyElementData(ref)
  },

  async copyElementData (ref) {
    const selected = HelperElement.getElement(ref)
    const tag = HelperDOM.getTag(selected)
    const attributes = HelperDOM.getAttributes(selected)
    const html = selected.innerHTML
    const refs = this.getAllRefs(selected.outerHTML)
    const style = this.getAllRefsStyle(refs)
    await this.saveToClipboard({ element: { tag, attributes, html, refs, style } })
  },

  getAllRefs (html) {
    const refs = []
    const matches = html.matchAll(/class="(.*?)"/g)
    for (const match of matches) {
      if (match[1].includes('component-element')) continue
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

  async cutElement () {
    const ref = StateSelectedElement.getRef()
    if (!this.isElementAllowed(ref)) return
    await this.copyElementData(ref)
    CanvasElement.addRemoveElementCommand(ref, 'cutElement', 'addElement')
    CanvasElementSelect.deselectElement()
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'element' })
  },

  async pasteElement () {
    const data = await this.getPastedData()
    if (!data.element) return
    const newElement = this.cloneElement(data.element)
    this.addPastedElementPlacement()
    this.createPastedElement(newElement)
    const ref = HelperElement.getRef(newElement)
    CanvasElement.addRemoveElementCommand(ref, 'pasteElement', 'removeElement', false)
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'element' })
  },

  cloneElement (data) {
    const refMap = this.generateNewRefs(data.refs)
    const node = HelperDOM.createElement(data.tag, document)
    for (let [name, value] of Object.entries(data.attributes)) {
      if (name.startsWith('xmlns')) continue
      if (name === 'class') value = value.replace('selected', '').trim()
      node.setAttributeNS(null, name, this.replaceMapValue(value, refMap))
    }
    node.innerHTML = this.replaceMapValue(data.html, refMap)
    this.cloneElementStyle(data.style, refMap)
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
    return value.replace(/e0[a-z0-9]+/g, match => map[match] || match)
  },

  cloneElementStyle (style, refMap) {
    for (const [tmpSelector, rules] of Object.entries(style)) {
      const selector = this.replaceMapValue(tmpSelector, refMap)
      StateStyleSheet.addSelector(selector, rules)
    }
  },

  addPastedElementPlacement (placement = null) {
    const element = StateSelectedElement.getElement()
    if (!HelperElement.isCanvasElement(element) || HelperElement.getType(element) === 'inline') {
      return
    }
    if (placement) {
      element.classList.add('placement', placement)
    } else {
      this.addGeneralPastedElementPlacement(element)
    }
  },

  addGeneralPastedElementPlacement (element) {
    const componentChildren = HelperElement.getComponentChildren(element)
    if (HelperElement.isComponent(element) && componentChildren) {
      componentChildren.classList.add('placement', 'inside')
    } else if (HelperElement.isContainer(element)) {
      element.classList.add('placement', 'inside')
    } else {
      element.classList.add('placement', 'bottom')
    }
  },

  createPastedElement (element) {
    CanvasElementCreate.createElementForPlacement(element)
    CanvasCommon.removePlacementMarker()
    if (!HelperElement.isHidden(element)) HelperDOM.show(element)
  },

  async duplicateElement () {
    await this.copyElement()
    await this.pasteDuplicateElement()
  },

  async pasteDuplicateElement () {
    const data = await this.getPastedData()
    if (!data.element) return
    const newElement = this.cloneElement(data.element)
    this.addPastedElementPlacement('bottom')
    this.createPastedElement(newElement)
    const ref = HelperElement.getRef(newElement)
    CanvasElement.addRemoveElementCommand(ref, 'duplicateElement', 'removeElement', false)
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'element' })
    CanvasElementSelect.selectElement(newElement)
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

  getAttributes (element, type) {
    return {
      type,
      attributes: this.getAttributesList(element),
      content: this.getContent(element, type)
    }
  },

  getAttributesList (element) {
    const ref = HelperElement.getRef(element)
    const attributes = {}
    for (const attr of element.attributes) {
      attributes[attr.name] = this.getAttributeValue(attr, ref)
    }
    return attributes
  },

  getAttributeValue (attr, ref) {
    if (attr.name === 'class') {
      return attr.value.replace(' selected', '').replace(ref, '').trim()
    } else {
      return attr.value
    }
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

  async pasteAll () {
    const ref = StateSelectedElement.getRef()
    // we can only paste inside elements
    if (!ref) return
    const data = await this.getPastedData()
    if (!data.attributes && !data.style) return
    this.pasteAllCommand(ref, data)
    HelperTrigger.triggerReload('right-panel-style')
  },

  async getPastedData () {
    const string = await navigator.clipboard.readText()
    return string ? ExtendJS.parseJsonNoError(string) : {}
  },

  pasteAllCommand (ref, data, execute = true) {
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
    if (execute) StateCommand.executeCommand(command.do)
  },

  getCurrentData (ref, pastedData) {
    const element = HelperElement.getElement(ref)
    const type = HelperElement.getType(element)
    const data = {}
    if (pastedData.attributes) data.attributes = this.getAttributes(element, type)
    if (pastedData.style) data.style = this.getStyle(element)
    return data
  },

  async copySelector () {
    const selector = StyleSheetSelector.getCurrentSelector()
    if (!selector) return null
    const properties = StateStyleSheet.getSelectorStyleProperties(selector)
    if (ExtendJS.isEmpty(properties)) return null
    await this.saveToClipboard({ selector: { selector, properties } })
    return properties
  },

  async cutSelector () {
    const properties = await this.copySelector()
    if (!properties) return
    const empty = StyleSheetProperties.getEmptyProperties(properties)
    RightCommon.changeStyle(empty, true, 'cutStyle')
  },

  async pasteSelector () {
    const ref = StateSelectedElement.getRef()
    // we can only paste inside elements
    if (!ref) return
    const data = await this.getPastedData()
    if (!data.selector) return
    const properties = this.joinProperties(data.selector.properties)
    RightCommon.changeStyle(properties, true, 'pasteStyle')
  },

  joinProperties (pastedProperties) {
    const selector = StyleSheetSelector.getCurrentSelector()
    const currentProperties = StateStyleSheet.getSelectorStyleProperties(selector)
    const empty = StyleSheetProperties.getEmptyProperties(currentProperties)
    return { ...empty, ...pastedProperties }
  }
}
