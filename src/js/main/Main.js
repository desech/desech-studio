import HelperEvent from '../helper/HelperEvent.js'

export default {
  getEvents () {
    return {
      click: ['clickOpenLinkEvent'],
      mouseup: ['mouseupNavigateButtonsEvent'],
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

  mouseupNavigateButtonsEvent (event) {
    if (event.button > 2) {
      event.preventDefault()
    }
  },

  focusinInputEvent (event) {
    if ((event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') &&
      !event.target.hasAttributeNS(null, 'readonly')) {
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
