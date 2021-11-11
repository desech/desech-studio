import HelperEvent from '../helper/HelperEvent.js'

export default {
  // these are the first events after the component and start events, but before other main events
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
      await window.electron.shellOpenExternal(event.target.closest('a').href)
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
  }
}
