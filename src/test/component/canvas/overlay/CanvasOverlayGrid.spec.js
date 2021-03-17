import test from 'ava'
import Fixture from '../../../Fixture.js'
import CanvasEvent from '../../../../js/component/canvas/CanvasEvent.js'
import CanvasOverlayEvent from '../../../../js/component/canvas/overlay/CanvasOverlayEvent.js'
import StateStyleSheet from '../../../../js/state/StateStyleSheet.js'

test.beforeEach(t => {
  Fixture.addMainContainers()
  CanvasEvent.addEvents()
  CanvasOverlayEvent.addEvents()
})

test.afterEach(t => {
  document.body.innerHTML = ''
  CanvasEvent.removeEvents()
  CanvasOverlayEvent.removeEvents()
})

test.serial('clickSwitchButtonEvent switch to grid', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // make the block bigger, deselect it, and then select it back to have the correct overlay size
  const elem = canvas.children[0]
  elem.style.width = '100px'
  elem.style.height = '100px'
  elem.style.columnGap = '5px' // set the computed style values
  elem.style.rowGap = '6px'
  elem.style.gridTemplateColumns = elem.style.gridTemplateRows = 'auto'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // switch the overlay mode
  const overlay = document.getElementById('element-overlay')
  const button = overlay.getElementsByClassName('overlay-button-switch')[0]
  button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  t.is(overlay.dataset.mode, 'grid')
  t.true(button.hasAttributeNS(null, 'hidden'))
  t.false(button.nextElementSibling.hasAttributeNS(null, 'hidden'))
  t.true(overlay.getElementsByClassName('resize-mode')[0].hasAttributeNS(null, 'hidden'))
  t.false(overlay.getElementsByClassName('grid-mode')[0].hasAttributeNS(null, 'hidden'))

  const columns = overlay.getElementsByClassName('track-columns')[0]
  t.is(columns.style.gridTemplateColumns, 'auto')
  t.is(columns.style.columnGap, '5px')
  t.is(columns.children.length, 1)
  t.is(columns.children[0].dataset.index, 'c0')
  t.is(columns.children[0].textContent, 'auto')

  const rows = overlay.getElementsByClassName('track-rows')[0]
  t.is(rows.style.gridTemplateRows, 'auto')
  t.is(rows.style.rowGap, '6px')
  t.is(rows.children.length, 1)
  t.is(rows.children[0].dataset.index, 'r0')
  t.is(rows.children[0].textContent, 'auto')

  const grid = overlay.getElementsByClassName('grid')[0]
  t.is(grid.style.gridTemplateColumns, 'auto')
  t.is(grid.style.gridTemplateRows, 'auto')
  t.is(grid.style.columnGap, '5px')
  t.is(grid.style.rowGap, '6px')
  t.is(grid.children.length, 1)
})

test.serial('clickSwitchButtonEvent switch to resize', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // switch the overlay mode twice
  const overlay = document.getElementById('element-overlay')
  const button = overlay.getElementsByClassName('overlay-button-switch')[0]
  button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  button.nextElementSibling.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  t.is(overlay.dataset.mode, 'resize')
  t.false(button.hasAttributeNS(null, 'hidden'))
  t.true(button.nextElementSibling.hasAttributeNS(null, 'hidden'))
  t.false(overlay.getElementsByClassName('resize-mode')[0].hasAttributeNS(null, 'hidden'))
  t.true(overlay.getElementsByClassName('grid-mode')[0].hasAttributeNS(null, 'hidden'))
})

test.serial('keydownSwitchButtonEvent switch to grid', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // switch the overlay mode twice
  const overlay = document.getElementById('element-overlay')
  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'g' }))

  const button = overlay.getElementsByClassName('overlay-button-switch')[0]
  t.is(overlay.dataset.mode, 'grid')
  t.true(button.hasAttributeNS(null, 'hidden'))
  t.false(button.nextElementSibling.hasAttributeNS(null, 'hidden'))
  t.true(overlay.getElementsByClassName('resize-mode')[0].hasAttributeNS(null, 'hidden'))
  t.false(overlay.getElementsByClassName('grid-mode')[0].hasAttributeNS(null, 'hidden'))
})

test.serial('clickAddCellEvent create column', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // make the block bigger, deselect it, and then select it back to have the correct overlay size
  const elem = canvas.children[0]
  elem.style.width = '100px'
  elem.style.height = '100px'
  elem.style.columnGap = '5px' // set the computed style values
  elem.style.rowGap = '6px'
  elem.style.gridTemplateColumns = elem.style.gridTemplateRows = 'auto'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // click add column button
  const overlay = document.getElementById('element-overlay')
  overlay.getElementsByClassName('overlay-button-switch')[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  const button = overlay.getElementsByClassName('track-add-column')[0]
  button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // manually set the computed value and re-select the element
  elem.style.gridTemplateColumns = StateStyleSheet.getPropertyValue('grid-template-columns')
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  const columns = overlay.getElementsByClassName('track-columns')[0]
  t.is(columns.style.gridTemplateColumns, 'auto auto')
  t.is(columns.children.length, 2)
  t.is(columns.children[0].dataset.index, 'c0')
  t.is(columns.children[1].dataset.index, 'c1')
  t.is(columns.children[0].textContent, 'auto')
  t.is(columns.children[1].textContent, 'auto')

  const grid = overlay.getElementsByClassName('grid')[0]
  t.is(grid.style.gridTemplateColumns, 'auto auto')
  t.is(grid.children.length, 2)
})

test.serial('clickAddCellEvent create row', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // make the block bigger, deselect it, and then select it back to have the correct overlay size
  const elem = canvas.children[0]
  elem.style.width = '100px'
  elem.style.height = '100px'
  elem.style.columnGap = '5px' // set the computed style values
  elem.style.rowGap = '6px'
  elem.style.gridTemplateColumns = elem.style.gridTemplateRows = 'auto'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // click add row button
  const overlay = document.getElementById('element-overlay')
  overlay.getElementsByClassName('overlay-button-switch')[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  const button = overlay.getElementsByClassName('track-add-row')[0]
  button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // manually set the computed value and re-select the element
  elem.style.gridTemplateRows = StateStyleSheet.getPropertyValue('grid-template-rows')
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  const rows = overlay.getElementsByClassName('track-rows')[0]
  t.is(rows.style.gridTemplateRows, 'auto auto')
  t.is(rows.children.length, 2)
  t.is(rows.children[0].dataset.index, 'r0')
  t.is(rows.children[1].dataset.index, 'r1')
  t.is(rows.children[0].textContent, 'auto')
  t.is(rows.children[1].textContent, 'auto')

  const grid = overlay.getElementsByClassName('grid')[0]
  t.is(grid.style.gridTemplateRows, 'auto auto')
  t.is(grid.children.length, 2)
})

test.serial('clickShowCellEvent show column', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // make the block bigger, deselect it, and then select it back to have the correct overlay size
  const elem = canvas.children[0]
  elem.style.width = '100px'
  elem.style.height = '100px'
  elem.style.columnGap = '5px' // set the computed style values
  elem.style.rowGap = '6px'
  elem.style.gridTemplateColumns = '1fr 2fr'

  StateStyleSheet.addStyleRules({
    selector: '#' + elem.id,
    properties: {
      'grid-template-columns': '1fr 2fr'
    }
  })

  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // click show column cell input
  const overlay = document.getElementById('element-overlay')
  overlay.getElementsByClassName('overlay-button-switch')[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  overlay.getElementsByClassName('track-column')[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  const container = overlay.getElementsByClassName('track-cell-options')[0]
  t.false(container.hasAttributeNS(null, 'hidden'))
  t.is(container.dataset.index, 'c0')
  t.is(container.getElementsByClassName('track-cell-size')[0].value, '1')
  t.is(container.getElementsByClassName('input-unit-measure')[0].value, 'fr')
})

test.serial('clickShowCellEvent show row', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // make the block bigger, deselect it, and then select it back to have the correct overlay size
  const elem = canvas.children[0]
  elem.style.width = '100px'
  elem.style.height = '100px'
  elem.style.columnGap = '5px' // set the computed style values
  elem.style.rowGap = '6px'
  elem.style.gridTemplateRows = '1fr 2fr'

  StateStyleSheet.addStyleRules({
    selector: '#' + elem.id,
    properties: {
      'grid-template-rows': '1fr 2fr'
    }
  })

  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // click show row cell input
  const overlay = document.getElementById('element-overlay')
  overlay.getElementsByClassName('overlay-button-switch')[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  overlay.getElementsByClassName('track-row')[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  const container = overlay.getElementsByClassName('track-cell-options')[0]
  t.false(container.hasAttributeNS(null, 'hidden'))
  t.is(container.dataset.index, 'r0')
  t.is(container.getElementsByClassName('track-cell-size')[0].value, '1')
  t.is(container.getElementsByClassName('input-unit-measure')[0].value, 'fr')
})

test.serial('clickShowCellEvent update column', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // make the block bigger, deselect it, and then select it back to have the correct overlay size
  const elem = canvas.children[0]
  elem.style.width = '100px'
  elem.style.height = '100px'
  elem.style.columnGap = '5px' // set the computed style values
  elem.style.rowGap = '6px'
  elem.style.gridTemplateColumns = '40px 60px'

  StateStyleSheet.addStyleRules({
    selector: '#' + elem.id,
    properties: {
      'grid-template-columns': '40px 60px'
    }
  })

  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // prepare the input
  const overlay = document.getElementById('element-overlay')
  overlay.getElementsByClassName('overlay-button-switch')[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  overlay.getElementsByClassName('track-column')[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // change the value and hit enter
  const input = overlay.getElementsByClassName('track-cell-size')[0]
  input.value = '45'
  input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter' }))

  // manually set the computed value and re-select the element
  elem.style.gridTemplateColumns = StateStyleSheet.getPropertyValue('grid-template-columns')
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  const container = overlay.getElementsByClassName('track-cell-options')[0]
  t.true(container.hasAttributeNS(null, 'hidden'))
  t.is(overlay.getElementsByClassName('track-column')[0].textContent, '45px')
  t.is(overlay.getElementsByClassName('track-columns')[0].style.gridTemplateColumns, '45px 60px')
  t.is(overlay.getElementsByClassName('grid')[0].style.gridTemplateColumns, '45px 60px')
})

test.serial('clickShowCellEvent update row', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // make the block bigger, deselect it, and then select it back to have the correct overlay size
  const elem = canvas.children[0]
  elem.style.width = '100px'
  elem.style.height = '100px'
  elem.style.columnGap = '5px' // set the computed style values
  elem.style.rowGap = '6px'
  elem.style.gridTemplateRows = '40px 60px'

  StateStyleSheet.addStyleRules({
    selector: '#' + elem.id,
    properties: {
      'grid-template-rows': '40px 60px'
    }
  })

  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // prepare the input
  const overlay = document.getElementById('element-overlay')
  overlay.getElementsByClassName('overlay-button-switch')[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  overlay.getElementsByClassName('track-row')[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // change the value and hit enter
  const input = overlay.getElementsByClassName('track-cell-size')[0]
  input.value = '45'
  input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter' }))

  // manually set the computed value and re-select the element
  elem.style.gridTemplateRows = StateStyleSheet.getPropertyValue('grid-template-rows')
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  const container = overlay.getElementsByClassName('track-cell-options')[0]
  t.true(container.hasAttributeNS(null, 'hidden'))
  t.is(overlay.getElementsByClassName('track-row')[0].textContent, '45px')
  t.is(overlay.getElementsByClassName('track-rows')[0].style.gridTemplateRows, '45px 60px')
  t.is(overlay.getElementsByClassName('grid')[0].style.gridTemplateRows, '45px 60px')
})

test.serial('clickDeleteCellEvent on column', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // make the block bigger, deselect it, and then select it back to have the correct overlay size
  const elem = canvas.children[0]
  elem.style.width = '100px'
  elem.style.height = '100px'
  elem.style.columnGap = '5px' // set the computed style values
  elem.style.rowGap = '6px'
  elem.style.gridTemplateColumns = '40px 60px'

  StateStyleSheet.addStyleRules({
    selector: '#' + elem.id,
    properties: {
      'grid-template-columns': '40px 60px'
    }
  })

  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // delete the column
  const overlay = document.getElementById('element-overlay')
  overlay.getElementsByClassName('overlay-button-switch')[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  overlay.getElementsByClassName('track-column')[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  overlay.getElementsByClassName('track-cell-delete')[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // manually set the computed value and re-select the element
  elem.style.gridTemplateColumns = StateStyleSheet.getPropertyValue('grid-template-columns')
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  const columns = overlay.getElementsByClassName('track-columns')[0]
  t.is(columns.children.length, 1)
  t.is(columns.children[0].dataset.index, 'c0')
  t.is(columns.children[0].textContent, '60px')
  t.is(columns.style.gridTemplateColumns, '60px')

  const grid = overlay.getElementsByClassName('grid')[0]
  t.is(grid.children.length, 1)
  t.is(grid.style.gridTemplateColumns, '60px')
})

test.serial('clickDeleteCellEvent on row', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // make the block bigger, deselect it, and then select it back to have the correct overlay size
  const elem = canvas.children[0]
  elem.style.width = '100px'
  elem.style.height = '100px'
  elem.style.columnGap = '5px' // set the computed style values
  elem.style.rowGap = '6px'
  elem.style.gridTemplateRows = '40px 60px'

  StateStyleSheet.addStyleRules({
    selector: '#' + elem.id,
    properties: {
      'grid-template-rows': '40px 60px'
    }
  })

  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // delete the row
  const overlay = document.getElementById('element-overlay')
  overlay.getElementsByClassName('overlay-button-switch')[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  overlay.getElementsByClassName('track-row')[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  overlay.getElementsByClassName('track-cell-delete')[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // manually set the computed value and re-select the element
  elem.style.gridTemplateRows = StateStyleSheet.getPropertyValue('grid-template-rows')
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  const rows = overlay.getElementsByClassName('track-rows')[0]
  t.is(rows.children.length, 1)
  t.is(rows.children[0].dataset.index, 'r0')
  t.is(rows.children[0].textContent, '60px')
  t.is(rows.style.gridTemplateRows, '60px')

  const grid = overlay.getElementsByClassName('grid')[0]
  t.is(grid.children.length, 1)
  t.is(grid.style.gridTemplateRows, '60px')
})
