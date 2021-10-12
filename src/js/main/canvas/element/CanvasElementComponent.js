import CanvasElementManage from './CanvasElementManage.js'
import HelperElement from '../../../helper/HelperElement.js'
import CanvasElement from '../CanvasElement.js'
import HelperTrigger from '../../../helper/HelperTrigger.js'
import HelperEvent from '../../../helper/HelperEvent.js'
import Page from '../../../page/Page.js'
import HelperCanvas from '../../../helper/HelperCanvas.js'
import StateSelectedElement from '../../../state/StateSelectedElement.js'
import StateCommand from '../../../state/StateCommand.js'
import HelperComponent from '../../../helper/HelperComponent.js'
import HelperDOM from '../../../helper/HelperDOM.js'

export default {
  getEvents () {
    return {
      dblclick: ['dblclickLoadComponentEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  async dblclickLoadComponentEvent (event) {
    if (HelperCanvas.getOperation() !== 'editing' &&
      event.target.closest('.element.component')) {
      await this.loadComponent(event.target.closest('.element.component'))
    }
  },

  async loadComponent (element) {
    const data = JSON.parse(element.dataset.ssComponent)
    await Page.loadMain(data.file)
  },

  async createElement (file) {
    const element = await this.buildComponentElement(file)
    if (!element) return
    CanvasElementManage.addPastedPlacement()
    CanvasElementManage.addPastedElement(element)
    const ref = HelperElement.getRef(element)
    CanvasElement.addRemoveElementCommand(ref, 'addElement', 'removeElement', false)
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'element' })
  },

  async buildComponentElement (file) {
    const html = await window.electron.invoke('rendererParseComponentFile', file)
    const element = document.createRange().createContextualFragment(html.canvas).children[0]
    if (!element) return
    const ref = HelperElement.getRef(element)
    const data = { ref, file, main: element.dataset.ssComponent }
    element.setAttributeNS(null, 'data-ss-component', JSON.stringify(data))
    return element
  },

  assignComponentHole (container) {
    const ref = StateSelectedElement.getRef()
    const hole = HelperComponent.getCurrentComponentHole()
    this.swapButtons(container, ref !== hole)
    this.execAssignComponentHole(ref, hole)
  },

  swapButtons (container, same) {
    const buttons = container.getElementsByClassName('style-html-component-hole')
    HelperDOM.toggle(buttons[0], !same)
    HelperDOM.toggle(buttons[1], same)
  },

  execAssignComponentHole (ref, hole, execute = true) {
    if (ref === hole) ref = null
    const command = {
      do: {
        command: 'assignComponentHole',
        current: ref,
        previous: hole
      },
      undo: {
        command: 'assignComponentHole',
        current: hole,
        previous: ref
      }
    }
    StateCommand.stackCommand(command)
    if (execute) StateCommand.executeCommand(command.do)
  }
}
