import StateCommand from '../../../../state/StateCommand.js'
import StateSelectedVariable from '../../../../state/StateSelectedVariable.js'
import RightVariableCommon from './RightVariableCommon.js'
import ChangeStyleField from '../../../../component/ChangeStyleField.js'
import ColorPicker from '../../../../component/ColorPicker.js'

export default {
  getEvents () {
    return {
      click: ['clickDeleteVariableEvent', 'clickCancelEvent'],
      change: ['changeUpdateNameEvent', 'changeUpdateFieldValueEvent'],
      colorchange: ['changecolorEvent']
    }
  },

  async clickDeleteVariableEvent (event) {
    if (event.target.closest('.right-variable-delete')) {
      await this.deleteVariable()
    }
  },

  clickCancelEvent (event) {
    if (event.target.closest('.right-variable-back')) {
      StateSelectedVariable.deselectVariable()
    }
  },

  async changeUpdateNameEvent (event) {
    if (event.target.classList.contains('right-variable-name')) {
      await this.updateName(event.target.closest('form'))
    }
  },

  async changeUpdateFieldValueEvent (event) {
    if (event.target.classList.contains('right-variable-value')) {
      await this.updateFieldValue(event.target)
    }
  },

  async changecolorEvent (event) {
    if (event.target.closest('.right-variable-value-container .color-picker') &&
      event.detail.apply) {
      await this.changeFill(event.target)
    }
  },

  async deleteVariable () {
    const data = StateSelectedVariable.getVariable()
    await this.deleteVariableExec(data)
    StateSelectedVariable.deselectVariable()
  },

  async deleteVariableExec (variable) {
    const command = {
      do: {
        command: 'deleteVariable',
        variable
      },
      undo: {
        command: 'createVariable',
        variable
      }
    }
    StateCommand.stackCommand(command)
    await StateCommand.executeCommand(command.do, { rightPanel: true })
  },

  async updateName (form) {
    const input = form.elements.name
    if (form.checkValidity()) RightVariableCommon.validateName(input)
    if (form.checkValidity()) await this.updateNameExec(input.value)
    input.reportValidity()
  },

  async updateNameExec (name) {
    const variable = StateSelectedVariable.getVariable()
    const command = {
      do: {
        command: 'updateVariable',
        ref: variable.ref,
        data: { name }
      },
      undo: {
        command: 'updateVariable',
        ref: variable.ref,
        data: { name: variable.name }
      }
    }
    StateCommand.stackCommand(command)
    await StateCommand.executeCommand(command.do)
  },

  async updateFieldValue (field) {
    const value = ChangeStyleField.getValue(field)
    await this.updateValue(value)
  },

  async changeFill (picker) {
    const value = ColorPicker.getColorPickerValue(picker)
    await this.updateValue(value)
  },

  async updateValue (value) {
    const variable = StateSelectedVariable.getVariable()
    const command = {
      do: {
        command: 'updateVariable',
        ref: variable.ref,
        data: { value }
      },
      undo: {
        command: 'updateVariable',
        ref: variable.ref,
        data: { value: variable.value }
      }
    }
    StateCommand.stackCommand(command)
    await StateCommand.executeCommand(command.do)
  }
}
