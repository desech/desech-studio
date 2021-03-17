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

test.serial('keydownDeleteElementEvent', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  const block = canvas.getElementsByClassName('block')[0]
  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'DELETE' }))
  t.true(block.hasAttributeNS(null, 'hidden'))
  t.is(canvas.dataset.selectedElement, undefined)
})

test.serial('keydownCopyElementEvent', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  const block = canvas.getElementsByClassName('block')[0]
  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'c', ctrlKey: true }))
  t.is(canvas.dataset.copiedElement, block.id)
})

test.serial('keydownCutElementEvent', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  const block = canvas.getElementsByClassName('block')[0]
  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'x', ctrlKey: true }))
  t.is(canvas.dataset.copiedElement, block.id)
  t.true(block.hasAttributeNS(null, 'hidden'))
  t.is(canvas.dataset.selectedElement, undefined)
})

test.serial('keydownPasteElementEvent from copy, paste inside block', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // create another block inside the first one
  const block1 = canvas.getElementsByClassName('block')[0]
  block1.classList.add('placement', 'inside')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  block1.classList.remove('placement', 'inside')

  // select our main block
  block1.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // copy the main block
  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'c', ctrlKey: true }))
  t.is(canvas.dataset.copiedElement, block1.id)

  // select the other main block - 3rd element
  const block2 = canvas.getElementsByClassName('block')[2]
  block2.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // paste the main block
  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'v', ctrlKey: true }))

  t.is(canvas.dataset.selectedElement, block2.id)
  t.is(block2.children.length, 1)
  t.is(block2.children[0].children.length, 1)
})

test.serial('keydownPasteElementEvent from copy, paste after element', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'text'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  canvas.dataset.tool = 'text'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  canvas.dataset.tool = 'text'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // select and copy our main element
  const elem1 = canvas.getElementsByClassName('text')[0]
  const elem3 = canvas.getElementsByClassName('text')[2]
  elem1.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'c', ctrlKey: true }))

  // select the middle element
  const elem2 = canvas.getElementsByClassName('text')[1]
  elem2.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // paste the main element
  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'v', ctrlKey: true }))

  t.is(canvas.dataset.selectedElement, elem2.id)
  t.is(elem3.id, canvas.getElementsByClassName('text')[3].id) // last element is still our 3rd element
})

test.serial('keydownPasteElementEvent from copy, paste in canvas', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // select and copy our main element
  const elem1 = canvas.getElementsByClassName('block')[0]
  const elem3 = canvas.getElementsByClassName('block')[2]
  elem1.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'c', ctrlKey: true }))

  // select the canvas
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // paste the main element
  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'v', ctrlKey: true }))

  t.is(canvas.dataset.selectedElement, undefined)
  t.is(elem3.id, canvas.getElementsByClassName('block')[2].id) // second to last element is still our 3rd element
})

test.serial('keydownPasteElementEvent from cut, paste in canvas', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // select and cut our main element
  const elem1 = canvas.getElementsByClassName('block')[0]
  const elem3 = canvas.getElementsByClassName('block')[2]
  elem1.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'x', ctrlKey: true }))

  // select the canvas
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // paste the main element
  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'v', ctrlKey: true }))

  t.is(canvas.dataset.selectedElement, undefined)
  t.is(elem3.id, canvas.getElementsByClassName('block')[2].id) // second to last element is still our 3rd element
  t.true(elem1.hasAttributeNS(null, 'hidden'))
  t.false(canvas.getElementsByClassName('block')[3].hasAttributeNS(null, 'hidden'))
})
