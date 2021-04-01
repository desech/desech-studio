import HelperEvent from '../../helper/HelperEvent.js'
import CanvasCommon from '../canvas/CanvasCommon.js'
import CanvasElementSelect from '../canvas/element/CanvasElementSelect.js'
import HelperCanvas from '../../helper/HelperCanvas.js'

export default {
  getEvents () {
    return {
      click: ['clickSwitchPreviewEvent'],
      keydown: ['keydownSwitchPreviewEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickSwitchPreviewEvent (event) {
    if (event.target.closest('.top-preview-button')) {
      this.switchPreview()
    }
  },

  keydownSwitchPreviewEvent (event) {
    if (event.key && HelperEvent.areMainShortcutsAllowed(event) &&
      HelperEvent.isNotCtrlAltShift(event) && event.key.toLowerCase() === 'p') {
      this.switchPreview()
    }
  },

  switchPreview () {
    const button = document.getElementsByClassName('top-preview-button')[0]
    const enabled = button.classList.contains('selected')
    enabled ? this.disablePreview(button) : this.enablePreview(button)
  },

  enablePreview (button) {
    CanvasCommon.enablePanelButton('select')
    CanvasElementSelect.deselectElement()
    button.classList.add('selected')
    HelperCanvas.addPreview()
    this.turnPropertiesOn()
  },

  disablePreview (button) {
    button.classList.remove('selected')
    HelperCanvas.removePreview()
    this.turnPropertiesOff()
  },

  turnPropertiesOn () {
    console.log('on')
  },

  turnPropertiesOff () {
    console.log('off')
  }
}
