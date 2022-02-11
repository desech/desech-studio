import StateStyleSheet from '../../../../state/StateStyleSheet.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import CanvasOverlayCommon from '../CanvasOverlayCommon.js'
import RightCommon from '../../../../main/right/RightCommon.js'
import InputUnitField from '../../../../component/InputUnitField.js'
import RightVariableInject from '../../../right/section/variable/RightVariableInject.js'

export default {
  async addCell (type, reloadPanel = true) {
    const property = `grid-template-${type}s`
    const value = StateStyleSheet.getPropertyValue(property) + ' auto'
    await this.changeStyle(property, value, reloadPanel)
  },

  async changeStyle (property, value, reloadPanel) {
    // this reloads the overlay and potentially the right panel too
    await RightCommon.changeStyle({ [property]: value }, reloadPanel)
  },

  async deleteCell (index, reloadPanel = true) {
    const type = this.extractTypeFromIndex(index)
    const trackArray = CanvasOverlayCommon.getTrackArray(type)
    const track = this.removeCellFromTrack(trackArray, index)
    const value = track.join(' ')
    await this.changeStyle(`grid-template-${type}s`, value, reloadPanel)
  },

  extractTypeFromIndex (index) {
    return index.substring(0, 1) === 'c' ? 'column' : 'row'
  },

  removeCellFromTrack (track, index) {
    const cellIndex = index.substring(1)
    track.splice(cellIndex, 1)
    return track
  },

  showCellOptions (cell) {
    const container = document.getElementsByClassName('track-cell-options-container')[0]
    const template = HelperDOM.getTemplate('template-grid-cell-options')
    HelperDOM.replaceOnlyChild(container, template)
    const main = container.children[0]
    this.setCellOptions(main, cell)
    this.setCellInput(main, cell)
  },

  setCellOptions (container, cell) {
    container.dataset.index = cell.dataset.index
    if (cell.classList.contains('track-column')) {
      this.setColumnOptions(container, cell)
    } else { // row
      this.setRowOptions(container, cell)
    }
  },

  setColumnOptions (container, cell) {
    container.style.top = '8px'
    const left = cell.offsetLeft + parseInt(cell.offsetWidth / 2) - 60
    container.style.left = (left >= 0 ? left : 0) + 'px'
  },

  setRowOptions (container, cell) {
    const top = cell.offsetTop + parseInt(cell.offsetHeight / 2) - 13
    container.style.top = (top >= 0 ? top : 0) + 'px'
    container.style.left = '8px'
  },

  setCellInput (container, cell) {
    const input = container.getElementsByClassName('track-cell-size')[0]
    const value = (cell.textContent === 'auto') ? '' : cell.textContent
    InputUnitField.setValue(input, value)
    input.focus()
    this.addCellInputName(input, cell.dataset.index)
    RightVariableInject.injectFieldVariables(input.nextElementSibling)
    RightVariableInject.updateFieldVariables(input)
  },

  addCellInputName (input, index) {
    const type = this.extractTypeFromIndex(index)
    input.name = `grid-template-${type}s`
    input.nextElementSibling.dataset.name = input.name
  },

  async applyCellChanges (input) {
    await this.updateCell(input)
    input.closest('.track-cell-options').remove()
  },

  async updateCell (input, reloadPanel = true) {
    const index = input.closest('.cell').dataset.index
    const type = this.extractTypeFromIndex(index)
    const value = this.getCellInputValue(input, type, index.substring(1))
    await this.changeStyle(`grid-template-${type}s`, value, reloadPanel)
    RightVariableInject.updateFieldVariables(input)
  },

  getCellInputValue (input, type, cellIndex) {
    const value = InputUnitField.getValue(input) || 'auto'
    const track = CanvasOverlayCommon.getTrackArray(type)
    track[cellIndex] = value
    return track.join(' ')
  }
}
