import HelperEvent from '../../../../helper/HelperEvent.js'
import StateCommand from '../../../../state/StateCommand.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import RightSelectorCommon from './RightSelectorCommon.js'

export default {
  getEvents () {
    return {
      click: ['clickSelectSelectorEvent', 'clickDeleteSelectorEvent', 'clickUnlinkClassEvent'],
      dragdropbefore: ['dragdropbeforeSortSelectorEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickSelectSelectorEvent (event) {
    if (event.target.closest('.selector-element')) {
      this.selectSelector(event.target.closest('.selector-element'))
    }
  },

  clickDeleteSelectorEvent (event) {
    if (event.target.closest('.delete-selector-button')) {
      this.deleteSelector(event.target.closest('li'))
    }
  },

  clickUnlinkClassEvent (event) {
    if (event.target.closest('.unlink-class-button')) {
      this.unlinkClass(event.target.closest('li'))
    }
  },

  dragdropbeforeSortSelectorEvent (event) {
    if (event.target.classList.contains('selector-list')) {
      this.sortSelector(event.target, event.detail)
    }
  },

  selectSelector (element) {
    const container = element.closest('.selector-list-container')
    RightSelectorCommon.selectSelector(element, container)
  },

  deleteSelector (element) {
    element.remove()
    this.selectDefaultSelector()
    this.callDeleteCommand(element.dataset.selector)
  },

  unlinkClass (element) {
    RightSelectorCommon.unlinkClass(element.dataset.selector)
  },

  selectDefaultSelector () {
    const element = document.getElementsByClassName('default-selector-list')[0].children[0]
    RightSelectorCommon.selectSelector(element)
  },

  callDeleteCommand (selector) {
    const command = {
      do: {
        command: 'removeSelector',
        selector,
        ref: StateSelectedElement.getRef()
      },
      undo: {
        command: 'addSelector',
        selector
      }
    }
    StateCommand.stackCommand(command)
    StateCommand.executeCommand(command.do)
  },

  sortSelector (list, data) {
    const selector = data.from.element.dataset.selector
    const current = this.getSelectorCurrentPosition(list.children, data.from.index)
    const sorted = this.getSelectorSortPosition(list.children, data.to.index)
    this.callSortCommand(selector, current, sorted)
  },

  getSelectorSortPosition (elements, pos) {
    if (elements[pos]) {
      return {
        position: 'top',
        target: elements[pos].dataset.selector
      }
    } else {
      return {
        position: 'bottom',
        target: elements[pos - 1].dataset.selector
      }
    }
  },

  getSelectorCurrentPosition (elements, pos) {
    if (elements[pos + 1]) {
      return {
        position: 'top',
        target: elements[pos + 1].dataset.selector
      }
    } else {
      return {
        position: 'bottom',
        target: elements[pos - 1].dataset.selector
      }
    }
  },

  callSortCommand (selector, current, sorted) {
    const command = {
      do: {
        command: 'sortSelector',
        ref: StateSelectedElement.getRef(),
        selector,
        ...sorted
      },
      undo: {
        command: 'sortSelector',
        ref: StateSelectedElement.getRef(),
        selector,
        ...current
      }
    }
    StateCommand.stackCommand(command)
    StateCommand.executeCommand(command.do)
  }
}
