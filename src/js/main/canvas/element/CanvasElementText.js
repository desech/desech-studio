import HelperEvent from '../../../helper/HelperEvent.js'
import HelperCanvas from '../../../helper/HelperCanvas.js'
import CanvasOverlay from '../CanvasOverlay.js'
import CanvasOverlayCommon from '../overlay/CanvasOverlayCommon.js'
import StateSelectedElement from '../../../state/StateSelectedElement.js'
import HelperElement from '../../../helper/HelperElement.js'
import CanvasTextOverlay from '../CanvasTextOverlay.js'
import StateCommand from '../../../state/StateCommand.js'
import HelperLocalStore from '../../../helper/HelperLocalStore.js'
import HelperDOM from '../../../helper/HelperDOM.js'
import HelperComponent from '../../../helper/HelperComponent.js'
import Crypto from '../../../../electron/lib/Crypto.js'

export default {
  _startWidth: null,
  _startHeight: null,
  _textChanged: false,

  getEvents () {
    return {
      dblclick: ['dblclickStartEditEvent', 'dblclickSelectWordEvent'],
      mousedown: ['mousedownFinishEditEvent'],
      keydown: ['keydownFinishEditEvent', 'keydownNewLineEvent', 'keydownButtonSpaceEvent',
        'keydownFormatTextEvent'],
      keyup: ['keyupUpdateOverlayEvent'],
      paste: ['pasteTextEvent'],
      input: ['inputTextEvent'],
      dragstart: ['dragstartTextEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  dblclickStartEditEvent (event) {
    if (!HelperCanvas.isOperation('editing') && !HelperCanvas.isPreview() &&
      event.target.closest('.element.text')) {
      this.startEditText(event.target.closest('.element.text'))
      // so we don't deselect the text
      event.preventDefault()
    }
  },

  async mousedownFinishEditEvent (event) {
    if (HelperCanvas.isOperation('editing') && !event.target.closest('.element.editable') &&
      !event.target.closest('#text-overlay')) {
      await this.finishEditText()
    }
  },

  async keydownFinishEditEvent () {
    if (event.key && HelperCanvas.isOperation('editing') && event.key === 'Escape') {
      await this.finishEditText()
    }
  },

  keyupUpdateOverlayEvent () {
    if (HelperCanvas.isOperation('editing')) {
      this.updateOverlaySizeAfterTyping()
    }
  },

  pasteTextEvent (event) {
    if (HelperCanvas.isOperation('editing')) {
      this.pasteCleanText(event.clipboardData)
      // stop the actual pasting of text
      event.preventDefault()
    }
  },

  keydownNewLineEvent (event) {
    if (event.key && HelperCanvas.isOperation('editing') && event.key === 'Enter') {
      this.addNewLine()
      // stop the actual div inserting
      event.preventDefault()
    }
  },

  keydownButtonSpaceEvent (event) {
    if (event.key && HelperCanvas.isOperation('editing') && event.code === 'Space' &&
      HelperDOM.getTag(event.target) === 'button') {
      this.addButtonSpace()
    }
  },

  keydownFormatTextEvent (event) {
    if (event.key && HelperCanvas.isOperation('editing') && HelperEvent.isCtrlCmd(event) &&
      !event.altKey && !event.shiftKey && ['b', 'i', 'u'].includes(event.key.toLowerCase())) {
      event.preventDefault()
    }
  },

  dblclickSelectWordEvent () {
    if (HelperCanvas.isOperation('editing')) {
      this.selectWord()
    }
  },

  inputTextEvent (event) {
    if (HelperCanvas.isOperation('editing') && event.target.closest('.element') &&
      !this._textChanged) {
      this.textHasChanged()
    }
  },

  dragstartTextEvent (event) {
    if (HelperCanvas.isOperation('editing')) {
      // stop d&d inside the text
      event.preventDefault()
    }
  },

  textHasChanged () {
    this._textChanged = true
  },

  startEditText (element) {
    if (!element) return
    this.fixEmptyText(element)
    StateSelectedElement.selectElement(element)
    this.prepareElementForUndo(element)
    this.makeElementEditable(element)
    HelperCanvas.setCanvasData('operation', 'editing')
    CanvasOverlay.setOverlayEditing()
    this.initSizes(element)
  },

  // if the text was just made empty, then you need to add a new line (Enter) for editing to work
  fixEmptyText (element) {
    if (element.textContent.trim() === '') {
      element.textContent = '\xA0'
      const pos = HelperElement.getPosition(element)
      this.resizeOverlay(pos)
    }
  },

  prepareElementForUndo (element) {
    element.dataset.textId = this.saveHtmlContent(element.innerHTML)
  },

  saveHtmlContent (html) {
    const id = 'text-' + Crypto.generateSmallID()
    HelperLocalStore.setItem(id, html)
    return id
  },

  makeElementEditable (element) {
    element.classList.add('editable')
    element.setAttributeNS(null, 'contenteditable', 'true')
    // select all the inside text
    window.getSelection().selectAllChildren(element)
  },

  initSizes (element) {
    const pos = HelperElement.getPosition(element)
    this._startWidth = pos.width
    this._startHeight = pos.height
  },

  async finishEditText () {
    const element = StateSelectedElement.getElement()
    await this.addUndoCommand(element)
    this.cancelElementEditable(element)
    HelperCanvas.deleteCanvasData('operation')
    CanvasOverlay.setOverlayEditing()
    this.clearState()
    CanvasTextOverlay.clearOverlay()
  },

  async addUndoCommand (element) {
    // we are changing the text twice, but we need the execution to update component overrides
    if (this._textChanged) {
      if (HelperComponent.isComponent(element) || HelperComponent.isComponentElement(element)) {
        this.updateHtmlNodesForComponent(element.children)
      }
      await this.changeTextCommand(element)
    }
    delete element.dataset.textId
  },

  // make sure we have component-element and the second ref class
  updateHtmlNodesForComponent (nodes) {
    for (const node of nodes) {
      if (!node.classList.contains('component-element')) {
        node.classList.add('component-element')
      }
      if (HelperElement.getAllRefs(node).length === 1) {
        HelperDOM.prependClass(node, HelperElement.generateElementRef())
      }
      if (node.children) this.updateHtmlNodesForComponent(node.children)
    }
  },

  async changeTextCommand (element, execute = true) {
    const ref = HelperElement.getRef(element)
    const command = {
      do: {
        command: 'changeText',
        ref,
        textId: this.saveHtmlContent(element.innerHTML)
      },
      undo: {
        command: 'changeText',
        ref,
        textId: element.dataset.textId
      }
    }
    StateCommand.stackCommand(command)
    if (execute) await StateCommand.executeCommand(command.do)
  },

  cancelElementEditable (element) {
    // @todo sometimes it's not canceled and we end up with contenteditable
    element.classList.remove('editable')
    element.removeAttributeNS(null, 'contenteditable')
    this.fixContent(element)
  },

  fixContent (element) {
    this.replaceNbsp(element)
    this.removeTrailingBr(element)
  },

  replaceNbsp (element) {
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        // &nbsp; is not actually rendered as that
        node.textContent = node.textContent.replace(/\xA0/g, ' ')
      }
    }
  },

  removeTrailingBr (element) {
    const last = element.childNodes[element.childNodes.length - 1]
    if (last && last.tagName === 'BR') last.remove()
  },

  clearState () {
    this._startWidth = null
    this._startHeight = null
    this._textChanged = false
  },

  updateOverlaySizeAfterTyping () {
    const element = StateSelectedElement.getElement()
    const pos = HelperElement.getPosition(element)
    if (this._startWidth !== pos.width || this._startHeight !== pos.height) {
      this.resizeOverlay(pos)
    }
  },

  resizeOverlay (pos) {
    const overlay = document.getElementById('element-overlay')
    CanvasOverlayCommon.setPosition(overlay, pos)
    this._startWidth = pos.width
    this._startHeight = pos.height
  },

  pasteCleanText (clipboard) {
    const clean = clipboard.getData('text/plain')
    document.execCommand('insertHTML', false, clean)
  },

  addNewLine () {
    // @todo fix the bug where <br> is added inside formatting tags
    document.execCommand('insertLineBreak')
  },

  addButtonSpace () {
    // this fixes the bug where pressing Space inside a button doesn't do anything
    document.execCommand('insertHTML', false, '&nbsp;')
  },

  selectWord () {
    window.getSelection().addRange(document.createRange())
  }
}
