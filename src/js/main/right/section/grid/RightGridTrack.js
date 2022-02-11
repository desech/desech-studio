import HelperDOM from '../../../../helper/HelperDOM.js'
import InputUnitField from '../../../../component/InputUnitField.js'
import CanvasOverlayCommon from '../../../canvas/overlay/CanvasOverlayCommon.js'
import CanvasOverlayGrid from '../../../canvas/overlay/CanvasOverlayGrid.js'
import CanvasOverlayGridTrack from '../../../canvas/overlay/grid/CanvasOverlayGridTrack.js'
import RightVariableInject from '../variable/RightVariableInject.js'

export default {
  getEvents () {
    return {
      click: ['clickAddCellEvent', 'clickDeleteCellEvent'],
      change: ['changeUpdateCellEvent']
    }
  },

  async clickAddCellEvent (event) {
    if (event.target.closest('.add-grid-cell')) {
      await this.addCell(event.target.closest('button'))
    }
  },

  async clickDeleteCellEvent (event) {
    if (event.target.closest('.delete-grid-cell')) {
      await this.deleteCell(event.target.closest('button'))
    }
  },

  async changeUpdateCellEvent (event) {
    if (event.target.classList.contains('grid-track-cell')) {
      await CanvasOverlayGridTrack.updateCell(event.target, false) // don't reload the panel
    }
  },

  async addCell (button) {
    CanvasOverlayGrid.setOverlayMode('grid')
    await CanvasOverlayGridTrack.addCell(button.dataset.type, false) // don't reload the panel
    this.reloadTrack(button.closest('.grid-cell'), button.dataset.type)
  },

  reloadTrack (container, type) {
    this.clearTrack(container, type)
    this.injectTrack(container, type)
  },

  clearTrack (parent, type) {
    const form = this.getTrackContainer(parent, type)
    HelperDOM.deleteChildren(form)
  },

  getTrackContainer (template, type) {
    return template.getElementsByClassName(`grid-${type}s-list`)[0]
  },

  async deleteCell (button) {
    CanvasOverlayGrid.setOverlayMode('grid')
    const index = button.closest('.cell').dataset.index
    await CanvasOverlayGridTrack.deleteCell(index, false) // don't reload the panel
    this.reloadTrack(button.closest('.grid-cell'), button.dataset.type)
  },

  injectTrack (template, type, style = null) {
    const form = this.getTrackContainer(template, type)
    const cells = CanvasOverlayCommon.getTrackArray(type, style)
    if (!cells) return
    this.injectTrackCells(form, type, cells)
    this.injectVariables(form)
  },

  injectTrackCells (form, type, cells) {
    for (let i = 0; i < cells.length; i++) {
      this.injectCell(form, {
        type: type,
        index: i,
        value: cells[i]
      })
    }
  },

  injectCell (form, data) {
    const cell = HelperDOM.getTemplate('template-style-grid-' + data.type)
    this.prefillCell(cell, data)
    form.appendChild(cell)
  },

  prefillCell (template, data) {
    const input = template.getElementsByClassName('input-unit-value')[0]
    InputUnitField.setValue(input, data.value !== 'auto' ? data.value : '')
    template.dataset.index = data.type.substring(0, 1) + data.index
  },

  injectVariables (form) {
    RightVariableInject.injectAllFieldVariables(form.elements)
    RightVariableInject.updateAllFieldVariables(form.elements)
  }
}
