import StateCommand from '../../state/StateCommand.js'
import HelperElement from '../../helper/HelperElement.js'
import StateStyleSheet from '../../state/StateStyleSheet.js'
import HelperCrypto from '../../helper/HelperCrypto.js'

export default {
  getMouseX (x) {
    const scroll = document.getElementsByClassName('canvas-container')[0].scrollLeft
    return x + scroll
  },

  getMouseY (y) {
    const scroll = document.getElementsByClassName('canvas-container')[0].scrollTop
    return y + scroll
  },

  cloneElement (element) {
    const clone = element.cloneNode(true)
    clone.classList.remove('selected')
    this.changeRefsOnClones([clone, ...clone.getElementsByClassName('element')])
    return clone
  },

  changeRefsOnElements (elements) {
    for (const element of elements) {
      // @todo duplicate the component properties refs too
      if (element.classList.contains('component-element')) continue
      const newRef = HelperElement.generateElementRef()
      StateStyleSheet.transferStyle(element, newRef)
      const oldRef = HelperElement.getRef(element)
      element.classList.replace(oldRef, newRef)
    }
  },

  cloneMoveElement (element) {
    // we don't allow hidden elements to be moved, because it will be impossible to undo
    element.classList.remove('selected')
    element.removeAttributeNS(null, 'data-ss-hidden')
    element.removeAttributeNS(null, 'hidden')
    const token = HelperCrypto.generateSmallHash()
    const clone = element.cloneNode(true)
    // the clone has the token, while the previous element has the previous token + the new token
    clone.setAttributeNS(null, 'data-ss-token', token)
    this.appendToken(element, token)
    return clone
  },

  appendToken (element, token = null) {
    if (!token) token = HelperCrypto.generateSmallHash()
    const tokens = [element.dataset.ssToken, token].join(' ').trim()
    element.setAttributeNS(null, 'data-ss-token', tokens)
  },

  addRemoveElementCommand (ref, doCommand, undoCommand, execute = true) {
    const command = {
      do: {
        command: doCommand,
        ref
      },
      undo: {
        command: undoCommand,
        ref
      }
    }
    StateCommand.stackCommand(command)
    if (execute) StateCommand.executeCommand(command.do)
  },

  moveElementCommand (token, execute = true) {
    const command = {
      do: {
        command: 'moveElement',
        token
      },
      undo: {
        command: 'moveElement',
        token
      }
    }
    StateCommand.stackCommand(command)
    if (execute) StateCommand.executeCommand(command.do)
  }
}
