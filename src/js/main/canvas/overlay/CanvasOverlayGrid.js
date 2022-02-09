import HelperEvent from '../../../helper/HelperEvent.js'
import HelperDOM from '../../../helper/HelperDOM.js'
import CanvasOverlayGridSetup from './grid/CanvasOverlayGridSetup.js'
import CanvasOverlayGridTrack from './grid/CanvasOverlayGridTrack.js'
import StateSelectedElement from '../../../state/StateSelectedElement.js'
import HelperElement from '../../../helper/HelperElement.js'
import CanvasOverlayCommon from './CanvasOverlayCommon.js'
import InputUnitField from '../../../component/InputUnitField.js'

export default {
  getEvents () {
    return {
      // order matters
      click: ['clickSwitchButtonEvent', 'clickAddCellEvent', 'clickHideCellEvent',
        'clickShowCellEvent', 'clickDeleteCellEvent'],
      keydown: ['keydownSwitchButtonEvent', 'keydownUpdateCellEvent']
    }
  },

  clickSwitchButtonEvent (event) {
    if (event.target.closest('.overlay-button-switch')) {
      this.switchOverlayModes()
    }
  },

  keydownSwitchButtonEvent (event) {
    if (event.key && HelperEvent.areMainShortcutsAllowed(event) &&
      HelperEvent.isNotCtrlAltShift(event) && event.key.toLowerCase() === 'g') {
      this.switchOverlayModes()
    }
  },

  async clickAddCellEvent (event) {
    if (event.target.closest('.track-add-cell')) {
      await CanvasOverlayGridTrack.addCell(event.target.closest('.track-add-cell').dataset.type)
    }
  },

  async clickDeleteCellEvent (event) {
    if (event.target.closest('.track-cell-delete')) {
      const index = event.target.closest('.track-cell-options').dataset.index
      await CanvasOverlayGridTrack.deleteCell(index)
    }
  },

  clickHideCellEvent (event) {
    if (!event.target.closest('.track-cell-options')) {
      this.hideCell()
    }
  },

  clickShowCellEvent (event) {
    if (event.target.closest('.track-column') || event.target.closest('.track-row')) {
      CanvasOverlayGridTrack.showCellOptions(event.target.closest('.track-cell'))
    }
  },

  keydownUpdateCellEvent (event) {
    if (event.key && (event.key === 'Escape' || event.key === 'Enter') &&
      event.target.classList.contains('track-cell-size')) {
      InputUnitField.setValueField(event.target, event.target.value)
      CanvasOverlayGridTrack.applyCellChanges(event.target)
      // stop de-selecting the element on Escape, but it also stops the InputUnitField event
      event.preventDefault()
    }
  },

  switchOverlayModes () {
    const button = document.querySelector('.overlay-button-switch:not([hidden])')
    if (button) this.setOverlayMode(button.dataset.switch)
  },

  setOverlayMode (type) {
    const overlay = document.getElementById('element-overlay')
    if (CanvasOverlayCommon.isOverlaySmall()) return
    overlay.dataset.mode = type
    const element = StateSelectedElement.getElement()
    if (!HelperElement.isContainer(element)) return
    this.toggleOverlayNodes(overlay, type)
    if (type === 'grid') CanvasOverlayGridSetup.setupGrid()
  },

  toggleOverlayNodes (overlay, type) {
    HelperDOM.toggle(overlay.getElementsByClassName('button-switch-resize')[0], type === 'resize')
    HelperDOM.toggle(overlay.getElementsByClassName('resize-mode')[0], type === 'resize')
    HelperDOM.toggle(overlay.getElementsByClassName('button-switch-grid')[0], type === 'grid')
    HelperDOM.toggle(overlay.getElementsByClassName('grid-mode')[0], type === 'grid')
  },

  hideCell () {
    const cell = document.querySelector('#element-overlay .track-cell-options:not([hidden])')
    if (cell) HelperDOM.hide(cell)
  }
}
