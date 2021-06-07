import HelperEvent from '../../helper/HelperEvent.js'
import CanvasCommon from '../canvas/CanvasCommon.js'
import CanvasElementSelect from '../canvas/element/CanvasElementSelect.js'
import HelperCanvas from '../../helper/HelperCanvas.js'
import TopCommon from './TopCommon.js'

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
    TopCommon.positionDragHandle()
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
    this.resetForms()
    this.turnPropertiesOff()
  },

  resetForms () {
    const canvas = HelperCanvas.getCanvas()
    for (const form of canvas.getElementsByTagName('form')) {
      form.reset()
    }
  },

  turnPropertiesOn () {
    // @todo finish it
  },

  turnPropertiesOff () {
    // @todo finish it
  }
}
