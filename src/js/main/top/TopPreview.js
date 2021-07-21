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
    this.resetResize()
    this.turnPropertiesOff()
  },

  resetForms () {
    const canvas = HelperCanvas.getCanvas()
    for (const form of canvas.getElementsByTagName('form')) {
      form.reset()
    }
    this.resetFieldsOutsideForm()
  },

  resetFieldsOutsideForm () {
    const canvas = HelperCanvas.getCanvas()
    this.resetValueOutsideForm(canvas.getElementsByTagName('input'))
    this.resetValueOutsideForm(canvas.getElementsByTagName('textarea'))
    this.resetCheckedOutsideForm(canvas.querySelectorAll('input[type="checkbox"]'))
    this.resetCheckedOutsideForm(canvas.querySelectorAll('input[type="radio"]'))
    // @todo select is pretty hard to reset because of multiple values and no default selected
  },

  resetValueOutsideForm (fields) {
    for (const field of fields) {
      if ((field.value || field.getAttribute('value')) &&
        field.value !== field.getAttribute('value')) {
        field.value = field.getAttribute('value')
      }
    }
  },

  resetCheckedOutsideForm (fields) {
    for (const field of fields) {
      if (field.checked !== field.hasAttribute('checked')) {
        field.checked = field.hasAttribute('checked')
      }
    }
  },

  resetResize () {
    const canvas = HelperCanvas.getCanvas()
    for (const element of canvas.querySelectorAll('[style]')) {
      element.removeAttributeNS(null, 'style')
    }
  },

  turnPropertiesOn () {
    // @todo finish it
  },

  turnPropertiesOff () {
    // @todo finish it
  }
}
