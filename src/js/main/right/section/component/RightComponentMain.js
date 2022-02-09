import CanvasElementComponent from '../../../canvas/element/CanvasElementComponent.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import StateCommand from '../../../../state/StateCommand.js'
import HelperComponent from '../../../../helper/HelperComponent.js'
import DialogComponent from '../../../../component/DialogComponent.js'

export default {
  getEvents () {
    return {
      setsource: ['setsourceSwapComponentEvent'],
      click: ['clickPromptResetOverridesEvent', 'clickConfirmResetOverridesEvent']
    }
  },

  async setsourceSwapComponentEvent (event) {
    if (event.target.id === 'swap-component-detail') {
      await this.swapComponent(event.detail)
    }
  },

  clickPromptResetOverridesEvent (event) {
    if (event.target.closest('.style-reset-overrides')) {
      this.promptResetOverrides(event.target.closest('.style-reset-overrides'))
    }
  },

  async clickConfirmResetOverridesEvent (event) {
    if (event.target.closest('.dialog-reset-overrides-confirm')) {
      const type = event.target.closest('button').dataset.type
      await CanvasElementComponent.resetOverrides(type)
    }
  },

  async swapComponent (file) {
    const element = StateSelectedElement.getElement()
    const data = HelperComponent.getComponentData(element)
    await this.swapComponentCommand(data, file)
  },

  async swapComponentCommand (data, file, execute = true) {
    const command = {
      do: {
        command: 'swapComponent',
        ref: data.ref,
        file
      },
      undo: {
        command: 'swapComponent',
        ref: data.ref,
        file: data.file
      }
    }
    StateCommand.stackCommand(command)
    if (execute) await StateCommand.executeCommand(command.do)
  },

  promptResetOverrides (button) {
    const dialog = DialogComponent.showDialog({
      header: DialogComponent.getContentHtml('reset-overrides', 'header'),
      footer: DialogComponent.getContentHtml('reset-overrides', 'footer')
    })
    const dialogButton = dialog.getElementsByClassName('dialog-reset-overrides-confirm')[0]
    dialogButton.dataset.type = button.dataset.type
  }
}
