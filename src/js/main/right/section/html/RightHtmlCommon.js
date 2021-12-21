import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import HelperElement from '../../../../helper/HelperElement.js'
import StateCommand from '../../../../state/StateCommand.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import HelperProject from '../../../../helper/HelperProject.js'
import Crypto from '../../../../../electron/lib/Crypto.js'

export default {
  getSelectedElementData () {
    const element = StateSelectedElement.getElement()
    return {
      element,
      refs: HelperElement.getAllRefsObject(element.classList),
      type: HelperElement.getType(element),
      tag: HelperElement.getTag(element)
    }
  },

  async changeAttributeCommand (ref, attributes, execute = true) {
    const element = HelperElement.getElement(ref)
    if (!element) return
    const command = this.initAttributeCommand(ref)
    this.setCommandAttributes(command, element, attributes)
    StateCommand.stackCommand(command)
    if (execute) await StateCommand.executeCommand(command.do)
  },

  initAttributeCommand (ref) {
    const command = 'changeAttribute'
    return {
      do: { command, ref, attributes: {} },
      undo: { command, ref, attributes: {} }
    }
  },

  // value: null = delete attr, string = new regular attr
  setCommandAttributes (command, element, attributes) {
    for (const [name, value] of Object.entries(attributes)) {
      if (!name) continue
      command.do.attributes[name] = value
      command.undo.attributes[name] = this.getAttributeValue(element, name, value)
    }
  },

  getAttributeValue (element, name, value) {
    return element.hasAttributeNS(null, name) ? element.getAttributeNS(null, name) : null
  },

  async setListHtmlCommand (commandName, element, list, type, execute = true) {
    const command = this.initSetListHtmlCommand(commandName, element, list, type)
    StateCommand.stackCommand(command)
    if (execute) await StateCommand.executeCommand(command.do)
  },

  initSetListHtmlCommand (command, element, list, type) {
    const ref = HelperElement.getRef(element)
    return {
      do: { command, ref, type, html: list.innerHTML },
      undo: { command, ref, type, html: element.innerHTML }
    }
  },

  async setSvgCommand (currentNode, newNode, execute = true) {
    const command = this.initSetSvgCommand(currentNode, newNode)
    StateCommand.stackCommand(command)
    if (execute) await StateCommand.executeCommand(command.do)
  },

  initSetSvgCommand (currentNode, newNode) {
    const ref = HelperElement.getRef(currentNode)
    return {
      do: {
        command: 'changeSvg',
        ref,
        inner: newNode.innerHTML,
        viewBox: newNode.getAttributeNS(null, 'viewBox')
      },
      undo: {
        command: 'changeSvg',
        ref,
        inner: currentNode.innerHTML,
        viewBox: currentNode.getAttributeNS(null, 'viewBox')
      }
    }
  },

  addSelectOptionToList (list, data) {
    const template = HelperDOM.getTemplate(`template-style-html-attr-${data.type}`)
    this.addSelectOptionData(template.children[0].elements, data)
    list.appendChild(template)
  },

  addSelectOptionData (fields, data) {
    if (data.text) fields.text.value = data.text
    if (data.value) fields.value.value = data.value
    if (data.label) fields.label.value = data.label
    if (data.selected) fields.selected.classList.add('selected')
    if (data.disabled) fields.disabled.classList.add('selected')
  },

  addTrackToList (list, data = null) {
    const template = HelperDOM.getTemplate('template-style-html-attr-media-track')
    const id = Crypto.generateSmallID()
    template.elements.source.id = `source-track-detail-${id}`
    if (data) this.addTrackData(template.elements, data)
    list.appendChild(template)
  },

  addTrackData (fields, data) {
    if (data.kind) fields.kind.value = data.kind
    if (data.src) this.setFileName(fields.src, data.src)
    if (data.srclang) fields.srclang.value = data.srclang
    if (data.label) fields.label.value = data.label
    if (data.default) fields.default.classList.add('selected')
  },

  setFileName (field, file) {
    if (!field) return
    field.value = decodeURI(file)
    field.textContent = decodeURI(HelperProject.getFileName(decodeURI(file)))
  },

  setHidden (hidden) {
    // null will delete the attribute, while '' will set it as a name only attribute
    const value = hidden ? '' : null
    this.changeAttributeCommand(StateSelectedElement.getRef(), {
      hidden: value,
      'data-ss-hidden': value
    })
  },

  getRemovableAttributes (element) {
    const remove = {}
    const ignore = this.getIgnoredAttributes()
    for (const attr of HelperElement.getAttributes(element)) {
      if (!ignore.includes(attr.name)) {
        remove[attr.name] = null
      }
    }
    return remove
  },

  // check StateHtmlFile.getRemovedAttributes()
  // CanvasElementCopyAttrStyle.getCopyIgnoredAttributes()
  getIgnoredAttributes () {
    return [
      'class', 'style', 'hidden',
      'data-ss-tag', 'data-ss-hidden', 'data-ss-token',
      'data-ss-properties', 'data-ss-component', 'data-ss-component-hole', 'data-variant'
    ]
  },

  async changeTagCommand (ref, tag, execute = true) {
    const element = HelperElement.getElement(ref)
    const command = 'changeTag'
    const cmd = {
      do: { command, ref, tag },
      undo: { command, ref, tag: HelperElement.getTag(element) }
    }
    StateCommand.stackCommand(cmd)
    if (execute) await StateCommand.executeCommand(cmd.do)
  }
}
