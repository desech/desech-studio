import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import HelperElement from '../../../../helper/HelperElement.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import CanvasOverlayCommon from '../CanvasOverlayCommon.js'
import HelperRegex from '../../../../helper/HelperRegex.js'
import HelperCanvas from '../../../../helper/HelperCanvas.js'

export default {
  setupGrid () {
    const data = this.getElementData()
    const overlay = document.getElementById('element-overlay')
    this.setContainer(overlay, data)
    this.setGrid(overlay, data)
    this.setGridTrack(overlay, data, 'column')
    this.setGridTrack(overlay, data, 'row')
  },

  getElementData () {
    const element = StateSelectedElement.getElement()
    const pos = HelperElement.getPosition(element)
    return {
      width: pos.width,
      height: pos.height,
      ...this.addComputedProps()
    }
  },

  addComputedProps () {
    const data = {}
    const style = StateSelectedElement.getStyle()
    const properties = [
      'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
      'border-top-width', 'border-bottom-width', 'border-left-width', 'border-right-width',
      'column-gap', 'row-gap', 'grid-template-columns', 'grid-template-rows', 'justify-content',
      'align-content'
    ]
    for (const prop of properties) {
      data[prop] = this.getComputedProp(prop, style)
    }
    return data
  },

  getComputedProp (name, style) {
    const value = StateSelectedElement.getComputed(name, style)
    if (['grid-template-columns', 'grid-template-rows'].includes(name)) {
      return this.getTemplateVisualValue(value)
    } else if (['justify-content', 'align-content'].includes(name)) {
      return value
    } else {
      return CanvasOverlayCommon.getVisualValue(parseInt(value))
    }
  },

  getTemplateVisualValue (template) {
    const values = HelperRegex.splitByCharacter(template, ' ')
    const zoom = HelperCanvas.getZoomFactor()
    const array = []
    for (const val of values) {
      array.push(Math.round(parseInt(val) * zoom) + 'px')
    }
    return array.join(' ')
  },

  setContainer (overlay, data) {
    const container = overlay.getElementsByClassName('grid-mode')[0]
    container.style.width = this.getContainerWidth(data) + 'px'
    container.style.height = this.getContainerHeight(data) + 'px'
    container.style.left = data['padding-left'] + data['border-left-width'] + 'px'
    container.style.top = data['padding-top'] + data['border-top-width'] + 'px'
  },

  getContainerWidth (data) {
    const extra = data['padding-left'] + data['padding-right'] + data['border-left-width'] +
      data['border-right-width']
    return data.width - extra
  },

  getContainerHeight (data) {
    const extra = data['padding-top'] + data['padding-bottom'] + data['border-top-width'] +
      data['border-bottom-width']
    return data.height - extra
  },

  setGrid (overlay, data) {
    const grid = overlay.getElementsByClassName('grid')[0]
    this.setGridStyle(grid, data)
    this.reloadGridCells(grid, this.getTotalCells(data))
  },

  setGridStyle (grid, data) {
    grid.style.columnGap = data['column-gap'] + 'px'
    grid.style.rowGap = data['row-gap'] + 'px'
    grid.style.gridTemplateColumns = data['grid-template-columns']
    grid.style.gridTemplateRows = data['grid-template-rows']
    grid.style.justifyContent = data['justify-content']
    grid.style.alignContent = data['align-content']
  },

  getTotalCells (data, type = 'grid') {
    const columns = HelperRegex.splitByCharacter(data['grid-template-columns'], ' ')
    const rows = HelperRegex.splitByCharacter(data['grid-template-rows'], ' ')
    switch (type) {
      case 'grid':
        return columns.length * rows.length
      case 'column':
        return columns.length
      case 'row':
        return rows.length
    }
  },

  reloadGridCells (grid, total) {
    this.clearCells(grid)
    this.loadCells(grid, 'template-grid-cells', total)
  },

  clearCells (container) {
    HelperDOM.deleteChildren(container)
  },

  loadCells (container, templateClass, total, cellDecorator = null) {
    const template = HelperDOM.getTemplate(templateClass)
    for (let i = 0; i < total; i++) {
      const clone = template.cloneNode()
      if (cellDecorator) cellDecorator(clone, i)
      container.appendChild(clone)
    }
  },

  setGridTrack (overlay, data, type) {
    const grid = overlay.getElementsByClassName('grid')[0]
    const track = overlay.getElementsByClassName(`track-${type}s`)[0]
    this.setGridTrackStyle(grid, track, type)
    this.reloadTrackCells(track, type, this.getTotalCells(data, type))
  },

  setGridTrackStyle (grid, track, type) {
    track.style[`grid-template-${type}s`] = grid.style[`grid-template-${type}s`]
    track.style[`${type}-gap`] = grid.style[`${type}-gap`]
    if (type === 'column') {
      track.style['justify-content'] = grid.style['justify-content']
    } else { // row
      track.style['align-content'] = grid.style['align-content']
    }
  },

  reloadTrackCells (track, type, total) {
    this.clearCells(track)
    const trackArray = CanvasOverlayCommon.getTrackArray(type)
    this.loadCells(track, `template-grid-track-${type}s`, total, (cell, i) => {
      cell.textContent = trackArray[i]
      cell.dataset.index = type.substring(0, 1) + i
    })
  }
}
