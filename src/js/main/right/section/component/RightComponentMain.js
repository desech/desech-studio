import HelperEvent from '../../../../helper/HelperEvent.js'
import CanvasElementComponent from '../../../canvas/element/CanvasElementComponent.js'
import CanvasElementManage from '../../../canvas/element/CanvasElementManage.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import HelperElement from '../../../../helper/HelperElement.js'
import StateCommand from '../../../../state/StateCommand.js'
import CanvasElementSelect from '../../../canvas/element/CanvasElementSelect.js'
import HelperComponent from '../../../../helper/HelperComponent.js'

export default {
  getEvents () {
    return {
      setsource: ['setsourceSwapComponentEvent'],
      click: ['clickResetOverridesEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  async setsourceSwapComponentEvent (event) {
    if (event.target.id === 'swap-component-detail') {
      await this.swapComponent(event.detail)
    }
  },

  async clickResetOverridesEvent (event) {
    if (event.target.closest('.style-reset-overrides')) {
      const type = event.target.closest('button').dataset.type
      await CanvasElementComponent.resetOverrides(type)
    }
  },

  async swapComponent (file) {
    const selected = StateSelectedElement.getElement()
    const swapRef = this.getSwapRef(selected)
    const newComp = await CanvasElementComponent.buildComponentElement(file, swapRef)
    if (!newComp) return
    selected.classList.add('placement', 'bottom')
    CanvasElementManage.addPastedElement(newComp)
    CanvasElementSelect.selectElementNode(newComp)
    await this.swapComponentCommand(selected, newComp)
  },

  getSwapRef (element) {
    if (HelperComponent.isComponentElement(element)) {
      return HelperComponent.getInstanceRef(element)
    }
  },

  async swapComponentCommand (selected, newComp, execute = true) {
    const currentRef = HelperElement.getRef(selected)
    const newRef = HelperElement.getRef(newComp)
    const command = {
      do: {
        command: 'swapComponent',
        currentRef,
        newRef
      },
      undo: {
        command: 'swapComponent',
        currentRef: newRef,
        newRef: currentRef
      }
    }
    StateCommand.stackCommand(command)
    if (execute) await StateCommand.executeCommand(command.do)
  }
}
