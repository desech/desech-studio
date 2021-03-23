import StateCommand from '../../state/StateCommand.js'
import HelperElement from '../../helper/HelperElement.js'
import StateStyleSheet from '../../state/StateStyleSheet.js'
import HelperDOM from '../../helper/HelperDOM.js'

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
    const cloneAndChildren = [clone, ...clone.getElementsByClassName('element')]
    this.cloneElementNodes(cloneAndChildren)
    if (clone.hasAttributeNS(null, 'list')) {
      this.cloneDatalist(clone, HelperElement.getRef(element))
    }
    return clone
  },

  cloneDatalist (current, previousRef) {
    const datalist = document.getElementById(`datalist-${previousRef}`)
    const clone = datalist.cloneNode(true)
    this.setDatalistIds(clone, current)
    HelperDOM.insertAfter(clone, datalist)
  },

  setDatalistIds (datalist, current) {
    datalist.id = `datalist-${HelperElement.getRef(current)}`
    current.setAttributeNS(null, 'list', datalist.id)
  },

  cloneElementNodes (elements) {
    for (const element of elements) {
      if (element.classList.contains('component-element')) continue
      const newRef = HelperElement.generateElementRef()
      StateStyleSheet.transferStyle(element, newRef)
      const oldRef = HelperElement.getRef(element)
      element.classList.replace(oldRef, newRef)
    }
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

  moveElementCommand (newRef, oldRef, execute = true) {
    const command = {
      do: {
        command: 'moveElement',
        show: newRef,
        hide: oldRef
      },
      undo: {
        command: 'moveElement',
        show: oldRef,
        hide: newRef
      }
    }
    StateCommand.stackCommand(command)
    if (execute) StateCommand.executeCommand(command.do)
  }
}
