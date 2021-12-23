import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import HelperElement from '../../../../helper/HelperElement.js'
import HelperClipboard from '../../../../helper/HelperClipboard.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import HelperStyle from '../../../../helper/HelperStyle.js'
import CanvasElementCopyCommon from './CanvasElementCopyCommon.js'
import StateCommand from '../../../../state/StateCommand.js'
import HelperComponent from '../../../../helper/HelperComponent.js'
import HelperOverride from '../../../../helper/HelperOverride.js'

export default {
  async copyAttrStyle () {
    const element = StateSelectedElement.getElement()
    const type = HelperElement.getType(element)
    const data = {
      attributes: this.getAttributes(element, type),
      style: CanvasElementCopyCommon.getStyle(element)
    }
    await HelperClipboard.saveData(data)
  },

  async copyAttributes () {
    const element = StateSelectedElement.getElement()
    const type = HelperElement.getType(element)
    const attributes = this.getAttributes(element, type)
    await HelperClipboard.saveData({ attributes })
  },

  async copyStyle () {
    const element = StateSelectedElement.getElement()
    const style = CanvasElementCopyCommon.getStyle(element)
    await HelperClipboard.saveData({ style })
  },

  async pasteAttrStyle () {
    const ref = StateSelectedElement.getRef()
    // we can only paste inside elements
    if (!ref) return
    const data = await HelperClipboard.getData()
    if (!data.attributes && !data.style) return
    await this.executePasteCommand(ref, data)
  },

  getAttributes (element, type, filter = true) {
    return {
      type,
      filter,
      tag: HelperDOM.getTag(element),
      attributes: this.getAttributesList(element, filter),
      content: this.getContent(element, type)
    }
  },

  getAttributesList (element, filter) {
    const ignored = this.getCopyIgnoredAttributes(element)
    const attributes = {}
    for (const attr of element.attributes) {
      if (!filter || !ignored.includes(attr.name)) {
        attributes[attr.name] = this.getAttributeValue(attr, filter)
      }
    }
    return attributes
  },

  // check RightHtmlCommon.getIgnoredAttributes()
  // this is used when we copy attributes from elements
  getCopyIgnoredAttributes (element) {
    return ['style', 'data-ss-remove', 'data-ss-token', 'data-ss-component',
      'data-ss-component-hole', 'data-variant']
  },

  getAttributeValue (attr, filter) {
    if (attr.name !== 'class') return attr.value
    if (filter) {
      return this.removeNonComponentClasses(attr.value)
    } else {
      return attr.value.replace(' selected', '').replace(' component-element', '').trim()
    }
  },

  removeNonComponentClasses (string) {
    const classes = string.trim().split(' ')
    for (let i = classes.length - 1; i >= 0; i--) {
      if (!classes[i] || !HelperStyle.isCssComponentClass(classes[i])) {
        classes.splice(i, 1)
      }
    }
    return classes.join(' ')
  },

  getContent (element, type) {
    if (['icon', 'video', 'audio', 'dropdown'].includes(type)) {
      return element.innerHTML
    }
    return null
  },

  async executePasteCommand (ref, data, execute = true) {
    const previousData = this.getAllElementData(ref, data.attributes, data.style)
    const command = {
      do: {
        command: 'pasteAttrStyle',
        ref,
        data
      },
      undo: {
        command: 'pasteAttrStyle',
        ref,
        data: previousData
      }
    }
    StateCommand.stackCommand(command)
    if (execute) await StateCommand.executeCommand(command.do)
  },

  getAllElementData (ref, hasAttributes, hasStyle) {
    const element = HelperElement.getElement(ref)
    const type = HelperElement.getType(element)
    const data = {}
    if (hasAttributes) {
      // we want the full data because we will remove everything and then add it again
      data.attributes = this.getAttributes(element, type, false)
    }
    if (hasStyle) data.style = CanvasElementCopyCommon.getStyle(element)
    this.addResetOverrides(element, data)
    return data
  },

  // when we undo, we need a way to reset all the overrides we have created
  addResetOverrides (element, data) {
    if (!HelperComponent.isComponentElement(element)) return
    const parent = HelperOverride.getMainParent(element, 'element')
    if (!parent?.data?.ref) return
    data.resetOverrides = {
      componentRef: parent.data.ref,
      overrides: parent.data.overrides
    }
  }
}
