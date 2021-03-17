import HelperEvent from '../../../../helper/HelperEvent.js'
import StateCommand from '../../../../state/StateCommand.js'
import HelperProject from '../../../../helper/HelperProject.js'

export default {
  getEvents () {
    return {
      change: ['changeEditMetaEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  changeEditMetaEvent (event) {
    if (event.target.classList.contains('right-page-field')) {
      this.editMeta(event.target.closest('form').elements)
    }
  },

  editMeta (fields) {
    const meta = { title: fields.title.value, meta: fields.meta.value }
    const command = {
      do: {
        command: 'changeMeta',
        meta
      },
      undo: {
        command: 'changeMeta',
        meta: HelperProject.getFileMeta()
      }
    }
    StateCommand.stackCommand(command)
    StateCommand.executeCommand(command.do)
  }
}
