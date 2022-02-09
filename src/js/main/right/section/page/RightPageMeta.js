import StateCommand from '../../../../state/StateCommand.js'
import HelperProject from '../../../../helper/HelperProject.js'

export default {
  getEvents () {
    return {
      change: ['changeEditMetaEvent']
    }
  },

  async changeEditMetaEvent (event) {
    if (event.target.classList.contains('right-page-field')) {
      await this.editMeta(event.target.closest('form').elements)
    }
  },

  async editMeta (fields) {
    const meta = {
      language: fields.language.value,
      title: fields.title.value,
      meta: fields.meta.value
    }
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
    await StateCommand.executeCommand(command.do)
  }
}
