import HelperEvent from '../helper/HelperEvent.js'

export default {
  getEvents () {
    return {
      click: ['clickOpenLinkEvent'],
      focusin: ['focusinInputEvent'],
      change: ['changeFocusOutEvent'],
      submit: ['submitIgnoreEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  async clickOpenLinkEvent (event) {
    if (event.target.closest('.desech-external-link')) {
      await this.openLink(event.target.closest('.desech-external-link'))
    }
  },

  focusinInputEvent (event) {
    if (event.target.tagName === 'INPUT') {
      event.target.select()
    }
  },

  changeFocusOutEvent (event) {
    event.target.blur()
  },

  submitIgnoreEvent (event) {
    event.preventDefault()
  },

  async openLink (a) {
    await window.electron.shellOpenExternal(a.href)
  }
}
