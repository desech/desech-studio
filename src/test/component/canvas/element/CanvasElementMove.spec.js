import test from 'ava'
import Fixture from '../../../Fixture.js'
import CanvasEvent from '../../../../js/component/canvas/CanvasEvent.js'

test.beforeEach(t => {
  Fixture.addMainContainers()
  CanvasEvent.addEvents()
})

test.afterEach(t => {
  document.body.innerHTML = ''
  CanvasEvent.removeEvents()
})

test.serial('mousedownEvent/move/up on a block', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  const block1 = canvas.children[0]
  const block2 = canvas.children[1]
  block1.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }))

  // start moving
  block2.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, buttons: true, clientX: 21, clientY: 10 }))
  t.is(canvas.dataset.selectedElement, undefined)
  t.is(canvas.dataset.operation, 'moving')
  t.is(block1.className, 'element block moving')
  t.is(block1.style.left, '11px')
  t.is(block1.style.top, '0px')
  t.is(block2.className, 'element block placement after')

  // moving
  block2.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, buttons: true, clientX: 21, clientY: 51 }))
  t.is(block1.style.left, '11px')
  t.is(block1.style.top, '41px')

  // end
  block2.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, altKey: false }))
  const block3 = document.getElementsByClassName('block')[2] // 3nd block
  t.is(canvas.dataset.selectedElement, block3.id)
  t.is(canvas.dataset.operation, undefined)
  t.true(block1.hasAttributeNS(null, 'hidden'))
  t.is(block3.className, 'element block selected')
})

test.serial('mousedownEvent/move/up on a block using alt key', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  const block1 = canvas.children[0]
  const block2 = canvas.children[1]
  block1.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }))
  block2.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, buttons: true, clientX: 21, clientY: 10 }))
  block2.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, buttons: true, clientX: 21, clientY: 51 }))
  block2.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, altKey: true }))

  const block3 = document.getElementsByClassName('block')[2] // 3nd block
  t.is(canvas.dataset.selectedElement, block3.id)
  t.false(block1.hasAttributeNS(null, 'hidden')) // block is still visible
  t.is(block3.className, 'element block selected')
})

test.serial('mousedownEvent/move/up on a block - not moving at all because of delta', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.selectedElement = 'exx00xx'
  canvas.innerHTML = '<div class="element block selected" id="exx00xx"></div><div class="element block" id="eyy00yy"></div>'

  const block1 = document.getElementById('exx00xx')
  const block2 = document.getElementById('eyy00yy')
  block1.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }))
  t.is(canvas.dataset.operation, 'moving')

  // start moving, but failing because of low delta
  block2.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, buttons: true, clientX: 19, clientY: 10 }))
  t.is(canvas.dataset.selectedElement, 'exx00xx')
  t.false(block1.classList.contains('moving'))
  t.is(canvas.dataset.operation, 'moving')

  // moving, but failing because of low delta
  block2.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, buttons: true, clientX: 19, clientY: 11 }))
  t.is(canvas.dataset.selectedElement, 'exx00xx')
  t.false(block1.classList.contains('moving'))
  t.is(canvas.dataset.operation, 'moving')

  // end
  block2.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, altKey: false }))
  t.is(canvas.dataset.selectedElement, 'exx00xx')
  t.false(block1.classList.contains('moving'))
  t.is(canvas.dataset.operation, undefined)
})
