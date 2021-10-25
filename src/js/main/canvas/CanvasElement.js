import StateCommand from '../../state/StateCommand.js'

export default {
  getMouseX (x) {
    const scroll = document.getElementsByClassName('canvas-container')[0].scrollLeft
    return x + scroll
  },

  getMouseY (y) {
    const scroll = document.getElementsByClassName('canvas-container')[0].scrollTop
    return y + scroll
  },

  removeHidden (element) {
    // we don't allow hidden elements to be moved, because it will be impossible to undo
    element.removeAttributeNS(null, 'data-ss-hidden')
    element.removeAttributeNS(null, 'hidden')
  },

  appendToken (element, token) {
    const tokens = [element.dataset.ssToken, token].join(' ').trim()
    element.setAttributeNS(null, 'data-ss-token', tokens)
  },

  async addRemoveElementCommand (ref, doCommand, undoCommand, execute = true) {
    const command = {
      do: { command: doCommand, ref },
      undo: { command: undoCommand, ref }
    }
    StateCommand.stackCommand(command)
    if (execute) await StateCommand.executeCommand(command.do)
  },

  async tokenCommand (token, command, execute = true) {
    const action = {
      do: { command, token },
      undo: { command, token }
    }
    StateCommand.stackCommand(action)
    if (execute) await StateCommand.executeCommand(action.do)
  }
}
