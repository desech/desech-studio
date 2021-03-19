import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import HelperElement from '../../../../helper/HelperElement.js'
import StateCommand from '../../../../state/StateCommand.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import HelperCrypto from '../../../../helper/HelperCrypto.js'
import HelperProject from '../../../../helper/HelperProject.js'

export default {
  getSelectedElementData () {
    const element = StateSelectedElement.getElement()
    const node = HelperElement.getNode(element)
    return {
      ref: HelperElement.getRef(element),
      element,
      node,
      type: HelperElement.getType(element),
      tag: HelperDOM.getTag(node)
    }
  },

  changeAttributeCommand (ref, attributes, execute = true) {
    const command = this.initAttributeCommand(ref)
    const element = HelperElement.getElement(ref)
    if (!element) return
    this.setAttributes(command, element, attributes)
    StateCommand.stackCommand(command)
    if (execute) StateCommand.executeCommand(command.do)
  },

  initAttributeCommand (ref) {
    return {
      do: {
        command: 'changeAttribute',
        ref,
        attributes: {}
      },
      undo: {
        command: 'changeAttribute',
        ref,
        attributes: {}
      }
    }
  },

  setAttributes (command, element, attributes) {
    for (const [name, value] of Object.entries(attributes)) {
      if (!name) continue
      command.do.attributes[name] = value
      command.undo.attributes[name] = this.getAttributeValue(element, name, value)
    }
  },

  getAttributeValue (element, name, value) {
    if (typeof value === 'boolean') {
      return element.hasAttributeNS(null, name)
    } else {
      return element.getAttributeNS(null, name) || ''
    }
  },

  setListHtmlCommand (commandName, element, list, type, execute = true) {
    const command = this.initSetListHtmlCommand(commandName, element, list, type)
    StateCommand.stackCommand(command)
    if (execute) StateCommand.executeCommand(command.do)
  },

  initSetListHtmlCommand (command, element, list, type) {
    const ref = HelperElement.getRef(element)
    return {
      do: {
        command,
        ref,
        type,
        html: list.innerHTML
      },
      undo: {
        command,
        ref,
        type,
        html: this.getListHtml(element, type)
      }
    }
  },

  getListHtml (element, type) {
    const ref = HelperElement.getRef(element)
    return (type === 'datalist') ? this.getDatalistHtml(ref) : element.innerHTML
  },

  getDatalistHtml (ref) {
    return document.getElementById(`datalist-${ref}`).innerHTML
  },

  setSvgCommand (element, svg, execute = true) {
    const command = this.initSetSvgCommand(element, svg)
    StateCommand.stackCommand(command)
    if (execute) StateCommand.executeCommand(command.do)
  },

  initSetSvgCommand (element, svg) {
    return {
      do: {
        command: 'changeSvg',
        ref: HelperElement.getRef(element),
        svg: svg.innerHTML,
        viewBox: svg.getAttributeNS(null, 'viewBox')
      },
      undo: {
        command: 'changeSvg',
        ref: HelperElement.getRef(element),
        svg: element.innerHTML,
        viewBox: element.getAttributeNS(null, 'viewBox')
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
    template.elements.source.id = `source-track-detail-${HelperCrypto.generateSmallHash()}`
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
    field.value = file
    field.textContent = HelperProject.getFileName(file)
  },

  hideElement (button) {
    this.setHidden(true)
    this.toggleHiddenButtons(true, button, button.nextElementSibling)
  },

  showElement (button) {
    this.setHidden(false)
    this.toggleHiddenButtons(false, button.previousElementSibling, button)
  },

  setHidden (value) {
    this.changeAttributeCommand(StateSelectedElement.getRef(), {
      hidden: value,
      'data-ss-hidden': value
    })
  },

  toggleHiddenButtons (value, hideButton, showButton) {
    HelperDOM.toggle(hideButton, !value)
    HelperDOM.toggle(showButton, value)
  },

  getRemovableAttributes (element) {
    const ignore = this.getIgnoredAttributes(element)
    const remove = {}
    for (const attr of HelperElement.getAttributes(element)) {
      if (!ignore.includes(attr.name)) {
        remove[attr.name] = attr.value ? '' : false
      }
    }
    return remove
  },

  getIgnoredAttributes (element) {
    let list = this.getMainAttributes()
    if (element.tagName === 'INPUT') list = [...list, 'type', 'placeholder', 'list']
    return list
  },

  // special attributes:
  //  data-ss-hidden, data-ss-disabled, data-ss-controls, type, list
  //  class, hidden, disabled, controls, viewBox, srcset
  getMainAttributes () {
    return ['class', 'hidden', 'data-ss-hidden', 'viewBox', 'srcset']
  },

  getAllIgnoredAttributes () {
    return [
      ...this.getMainAttributes(),
      'disabled', 'data-ss-disabled', 'controls', 'data-ss-controls', 'type', 'list'
    ]
  },

  changeTagCommand (ref, tag, execute = true) {
    const element = HelperElement.getElement(ref)
    const command = 'changeTag'
    const cmd = {
      do: { command, ref, tag },
      undo: { command, ref, tag: HelperDOM.getTag(element) }
    }
    StateCommand.stackCommand(cmd)
    if (execute) StateCommand.executeCommand(cmd.do)
  }
}
