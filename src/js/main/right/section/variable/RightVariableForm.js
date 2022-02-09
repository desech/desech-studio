import StateCommand from '../../../../state/StateCommand.js'
import StateSelectedVariable from '../../../../state/StateSelectedVariable.js'
import InputUnitField from '../../../../component/InputUnitField.js'

export default {
  getEvents () {
    return {
      click: ['clickDeleteVariableEvent'],
      change: ['changeUpdateNameEvent', 'changeUpdateValueInputEvent']
    }
  },

  async clickDeleteVariableEvent (event) {
    if (event.target.closest('.right-variable-delete')) {
      await this.deleteVariable()
    }
  },

  async changeUpdateNameEvent (event) {
    if (event.target.classList.contains('right-variable-name')) {
      await this.updateName(event.target.value)
    }
  },

  async changeUpdateValueInputEvent (event) {
    if (event.target.classList.contains('right-variable-input')) {
      await this.updateValueInput(event.target)
    }
  },

  async deleteVariable () {
    const variable = StateSelectedVariable.getVariable()
    await this.deleteVariableExec(variable)
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
    await StateCommand.executeCommand(command.do)
  },

  async updateName (name) {
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

  async updateValueInput (input) {
    const value = InputUnitField.getValue(input)
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
