import CanvasElementCopyElement from './copypaste/CanvasElementCopyElement.js'
import HelperElement from '../../../helper/HelperElement.js'
import CanvasElement from '../CanvasElement.js'
import HelperTrigger from '../../../helper/HelperTrigger.js'
import Page from '../../../page/Page.js'
import HelperCanvas from '../../../helper/HelperCanvas.js'
import StateSelectedElement from '../../../state/StateSelectedElement.js'
import StateCommand from '../../../state/StateCommand.js'
import HelperComponent from '../../../helper/HelperComponent.js'
import HelperDOM from '../../../helper/HelperDOM.js'
import HelperOverride from '../../../helper/HelperOverride.js'
import ExtendJS from '../../../helper/ExtendJS.js'
import StyleSheetComponent from '../../../state/stylesheet/StyleSheetComponent.js'

export default {
  getEvents () {
    return {
      dblclick: ['dblclickLoadComponentEvent']
    }
  },

  async dblclickLoadComponentEvent (event) {
    const element = event.target.closest('.element')
    if (!HelperCanvas.isOperation('editing') && element && HelperComponent.isComponent(element)) {
      await this.loadComponent(element)
    }
  },

  async loadComponent (element) {
    const file = HelperComponent.getInstanceFile(element)
    await Page.loadMain(file)
  },

  async createElement (file) {
    const ref = HelperElement.generateElementRef()
    const element = await HelperComponent.fetchComponent({ file, ref })
    if (!element) return
    CanvasElementCopyElement.addPastedPlacement()
    CanvasElementCopyElement.addPastedElement(element)
    await CanvasElement.addRemoveElementCommand(ref, 'addElement', 'removeElement', false)
    HelperTrigger.triggerReload('sidebar-left-panel', { panels: ['element'] })
  },

  async assignComponentHole (container) {
    const ref = StateSelectedElement.getRef()
    const hole = HelperComponent.getMainHole()
    this.swapButtons(container, ref !== hole)
    await this.execAssignComponentHole(ref, hole)
  },

  swapButtons (container, same) {
    const buttons = container.getElementsByClassName('style-html-component-hole')
    HelperDOM.toggle(buttons[0], !same)
    HelperDOM.toggle(buttons[1], same)
  },

  async execAssignComponentHole (ref, hole, execute = true) {
    if (ref === hole) ref = null
    const command = 'assignComponentHole'
    const cmd = {
      do: { command, current: ref, previous: hole },
      undo: { command, current: hole, previous: ref }
    }
    StateCommand.stackCommand(cmd)
    if (execute) await StateCommand.executeCommand(cmd.do)
  },

  // we are only resetting the overrides of a particular element or component from inside
  // that component; to reset the whole component, you need to do it at the top component level
  // variants are reseted only when we do it at the top level component
  // on elements we only reset the element style
  // on the top level component or any sub-component we reset all the styles
  async resetOverrides (type, execute = true) {
    const command = (type === 'component') ? 'resetComponentOverrides' : 'resetElementOverrides'
    const element = StateSelectedElement.getElement()
    const elementRef = (type === 'element') ? HelperElement.getStyleRef(element) : null
    const parent = HelperOverride.getMainParent(element, type)
    const overrides = this.getResetedOverrides(parent, element, type)
    const variants = parent.topLevel ? null : parent.data.variants
    const style = StyleSheetComponent.getOverrides(parent.data.ref, elementRef)
    const cmd = this.getResetedOverridesCommand(command, element, parent, style, overrides,
      variants)
    StateCommand.stackCommand(cmd)
    if (execute) await StateCommand.executeCommand(cmd.do)
  },

  getResetedOverrides (parent, element, type) {
    if (parent?.topLevel || !parent?.data?.overrides) return null
    const ref = HelperOverride.getOverrideRef(element, type)
    const obj = ExtendJS.cloneData(parent.data.overrides)
    // remove the component/element overrides from our component data
    ExtendJS.removeDeepIndex(obj, ref)
    ExtendJS.clearEmptyObjects(obj)
    return obj
  },

  getResetedOverridesCommand (command, element, parent, style, overrides, variants) {
    // after the component replacement elements get a new ref, but sub-components still keep
    // their component ref, so we can use that to select the component back
    const subRef = HelperComponent.isComponent(element)
      ? HelperElement.getComponentRef(element)
      : null
    return {
      do: {
        command,
        parentRef: parent.data.ref,
        subRef,
        styleAction: 'remove',
        style,
        component: {
          file: parent.data.file,
          ref: parent.data.ref,
          overrides,
          variants
        }
      },
      undo: {
        command,
        parentRef: parent.data.ref,
        subRef,
        styleAction: 'add',
        style,
        component: {
          file: parent.data.file,
          ref: parent.data.ref,
          overrides: parent.data?.overrides,
          variants: parent.data?.variants
        }
      }
    }
  }
}
