import HelperEvent from '../../../../helper/HelperEvent.js'

export default {
  getEvents () {
    return {
      click: ['clickCreateVariableEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  async clickCreateVariableEvent (event) {
    if (event.target.classList.contains('variable-field') &&
      event.target.value === 'desech-variable-input-create') {
      await this.createVariable(event.target)
    }
  },

  async createVariable (field) {
    
  }
}
