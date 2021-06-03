import HelperEvent from '../../helper/HelperEvent.js'
import StateCommand from '../../state/StateCommand.js'
import TopCommon from './TopCommon.js'
import InputUnitField from '../../component/InputUnitField.js'
import HelperDOM from '../../helper/HelperDOM.js'
import HelperTrigger from '../../helper/HelperTrigger.js'
import HelperCanvas from '../../helper/HelperCanvas.js'
import ExtendJS from '../../helper/ExtendJS.js'

export default {
  getEvents () {
    return {
      click: ['clickAddOverlayEvent', 'clickClearCreateOverlayEvent',
        'clickSwitchResponsiveEvent', 'clickDeleteResponsiveEvent'],
      change: ['changeAddResponsiveEvent', 'changeEditResponsiveEvent', 'changeCanvasSizeEvent'],
      keydown: ['keydownClearCreateOverlayEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickAddOverlayEvent (event) {
    if (event.target.closest('.responsive-add')) {
      this.toggleAddOverlay(event.target.closest('.responsive-add'))
    }
  },

  keydownClearCreateOverlayEvent (event) {
    if (event.key && HelperEvent.isNotCtrlAltShift(event) && event.key === 'Escape') {
      this.clearCreateOverlay()
    }
  },

  clickClearCreateOverlayEvent (event) {
    if (!event.target.closest('.responsive-create-overlay-container') &&
      !event.target.closest('.responsive-add')) {
      this.clearCreateOverlay()
    }
  },

  clickSwitchResponsiveEvent (event) {
    if (event.target.closest('.responsive-mode')) {
      this.switchResponsive(event.target.closest('.responsive-mode'))
    }
  },

  clickDeleteResponsiveEvent (event) {
    if (event.target.closest('.responsive-delete')) {
      this.deleteResponsive(event.target.closest('form'))
    }
  },

  changeAddResponsiveEvent (event) {
    if (event.target.classList.contains('responsive-input-add')) {
      this.addResponsive(event.target.closest('form'))
    }
  },

  changeEditResponsiveEvent (event) {
    if (event.target.classList.contains('responsive-input-edit')) {
      this.editResponsive(event.target.closest('form'))
    }
  },

  changeCanvasSizeEvent (event) {
    if (event.target.classList.contains('canvas-size-field')) {
      this.changeCanvasSize(event.target)
    }
  },

  clearCreateOverlay () {
    const container = document.getElementsByClassName('responsive-create-overlay-container')[0]
    if (container && container.children.length) HelperDOM.deleteChildren(container)
  },

  toggleAddOverlay (button) {
    if (button.nextElementSibling.children.length) {
      this.clearCreateOverlay()
    } else {
      TopCommon.createOverlay(button.nextElementSibling, 'add')
    }
  },

  switchResponsive (button) {
    const data = JSON.parse(button.dataset.data)
    TopCommon.resizeCanvas(data)
    HelperTrigger.triggerReload('element-overlay')
  },

  addResponsive (form) {
    const data = this.getResponsiveValue(form.elements)
    if (ExtendJS.isEmpty(data)) return
    this.createResponsiveMode(data)
    this.clearCreateOverlay()
  },

  getResponsiveValue (fields) {
    return {
      ...this.getInput(fields['min-width']),
      ...this.getInput(fields['max-width'])
    }
  },

  getInput (input) {
    let value = InputUnitField.getValue(input)
    if (ExtendJS.isNumeric(value)) value += 'px'
    return parseInt(value) > 0 ? { [input.name]: value } : null
  },

  createResponsiveMode (responsive) {
    const command = {
      do: {
        command: 'addResponsive',
        responsive
      },
      undo: {
        command: 'removeResponsive',
        responsive
      }
    }
    StateCommand.stackCommand(command)
    StateCommand.executeCommand(command.do)
  },

  editResponsive (form) {
    const data = this.getResponsiveValue(form.elements)
    const button = form.closest('.responsive-unit').children[0]
    const previous = JSON.parse(button.dataset.data)
    TopCommon.editResponsiveMode(data, previous)
  },

  deleteResponsive (form) {
    const data = this.getResponsiveValue(form.elements)
    this.deleteResponsiveMode(data)
  },

  deleteResponsiveMode (responsive) {
    const command = {
      do: {
        command: 'removeResponsive',
        responsive
      },
      undo: {
        command: 'addResponsive',
        responsive
      }
    }
    StateCommand.stackCommand(command)
    StateCommand.executeCommand(command.do)
  },

  changeCanvasSize (input) {
    const data = HelperCanvas.getCurrentResponsiveData()
    const current = this.getCurrentCanvasSizeData(input, data)
    TopCommon.editResponsiveMode(current, this.getPreviousData(data))
  },

  getCurrentCanvasSizeData (input, data) {
    if (input.name === 'width') {
      return this.getCurrentData(data, input.value + 'px')
    } else { // height
      return this.getCurrentData(data, null, input.value + 'px')
    }
  },

  getCurrentData (data, width = null, height = null) {
    return {
      'min-width': data['min-width'],
      'max-width': data['max-width'],
      width: width || HelperCanvas.getCanvasWidth(),
      height: height || HelperCanvas.getCanvasHeight()
    }
  },

  getPreviousData (data) {
    return {
      'min-width': data['min-width'],
      'max-width': data['max-width'],
      width: data.width,
      height: data.height
    }
  }
}
