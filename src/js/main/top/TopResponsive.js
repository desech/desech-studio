import HelperEvent from '../../helper/HelperEvent.js'
import StateCommand from '../../state/StateCommand.js'
import TopCommon from './TopCommon.js'
import InputUnitField from '../../component/InputUnitField.js'
import HelperDOM from '../../helper/HelperDOM.js'
import HelperTrigger from '../../helper/HelperTrigger.js'
import HelperCanvas from '../../helper/HelperCanvas.js'
import ExtendJS from '../../helper/ExtendJS.js'
import CheckButtonField from '../../component/CheckButtonField.js'
import CanvasElementSelect from '../canvas/element/CanvasElementSelect.js'

export default {
  _resize: null,
  // needed because resize window events are triggered more than once
  _resizeWindowTimer: null,

  getEvents () {
    return {
      click: ['clickAddOverlayEvent', 'clickClearCreateOverlayEvent',
        'clickSwitchResponsiveEvent', 'clickDeleteResponsiveEvent'],
      change: ['changeAddResponsiveEvent', 'changeEditResponsiveEvent', 'changeCanvasSizeEvent'],
      keydown: ['keydownClearCreateOverlayEvent'],
      mousedown: ['mousedownStartDragResizeEvent'],
      mousemove: ['mousemoveContinueDragResizeEvent'],
      mouseup: ['mouseupEndDragResizeEvent'],
      resize: ['resizeWindowEvent']
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

  mousedownStartDragResizeEvent (event) {
    if (event.target.closest('#canvas-resize')) {
      this.startDragResize(event.clientX)
    }
  },

  mousemoveContinueDragResizeEvent (event) {
    if (this._resize && this._resize.startX && event.buttons) {
      if (!this._resize.moving) {
        this.initDragResize(event.clientX)
      } else {
        this.continueDragResize(event.clientX)
      }
    }
  },

  mouseupEndDragResizeEvent (event) {
    if (this._resize && this._resize.startX) {
      this.endDragResize()
    }
  },

  resizeWindowEvent (event) {
    clearTimeout(this._resizeWindowTimer)
    this._resizeWindowTimer = setTimeout(() => {
      TopCommon.positionDragHandle()
    }, 100)
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
    TopCommon.setResponsiveSizeCanvas(data)
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
    const value = InputUnitField.getValue(input)
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
    } else {
      // height
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
  },

  startDragResize (clientX) {
    const canvas = HelperCanvas.getCanvas()
    const responsive = HelperCanvas.getCurrentResponsiveData() || {}
    this._resize = {
      canvas,
      startX: clientX,
      startWidth: canvas.offsetWidth,
      zoom: HelperCanvas.getZoomFactor(canvas),
      handle: document.getElementById('canvas-resize'),
      modes: TopCommon.getResponsiveModes(),
      initialResponsive: responsive,
      currentResponsive: responsive,
      moving: false
    }
  },

  initDragResize (clientX) {
    if (Math.abs(this._resize.startX - clientX) > 10) {
      CanvasElementSelect.deselectElement()
      this._resize.moving = true
    }
  },

  continueDragResize (clientX) {
    const width = this._resize.startWidth - (this._resize.startX - clientX)
    const handleLeft = TopCommon.getDragHandleLeftPost(this._resize.canvas, this._resize.zoom)
    if (width < 100) return
    this._resize.canvas.style.width = width + 'px'
    this._resize.handle.style.left = handleLeft
    this.switchResizeResponsiveClasses(width)
  },

  switchResizeResponsiveClasses (width) {
    for (const data of this._resize.modes) {
      if (width >= data.range[0] && width <= data.range[1]) {
        if (this._resize.currentResponsive.value !== data.value) {
          TopCommon.addCanvasResponsiveClass(data)
          this._resize.currentResponsive = data
          return
        }
        return
      }
    }
    // no modes were compatible, so this must be the default mode without responsiveness
    if (this._resize.currentResponsive.value) {
      TopCommon.addCanvasResponsiveClass()
      this._resize.currentResponsive = {}
    }
  },

  endDragResize () {
    if (this._resize.initialResponsive.value !== this._resize.currentResponsive.value) {
      if (this._resize.currentResponsive.ref) {
        this.switchQuickResponsive(this._resize.currentResponsive)
      } else {
        this.switchQuickDefaltMode()
      }
    }
    this._resize = null
  },

  switchQuickResponsive (data) {
    const button = document.querySelector(`.responsive-mode[data-ref="${data.ref}"]`)
    CheckButtonField.toggleButton(button)
    TopCommon.updateSizeText(data.width, data.height)
  },

  switchQuickDefaltMode () {
    const button = document.getElementById('responsive-mode-default')
    CheckButtonField.toggleButton(button)
    const data = JSON.parse(button.dataset.data)
    TopCommon.updateSizeText(data.width, data.height)
  }
}
