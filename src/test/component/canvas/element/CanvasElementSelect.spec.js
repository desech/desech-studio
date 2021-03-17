import test from 'ava'
import Fixture from '../../../Fixture.js'
import CanvasEvent from '../../../../js/component/canvas/CanvasEvent.js'
import CanvasTextOverlayEvent from '../../../../js/component/canvas/text-overlay/CanvasTextOverlayEvent.js'

test.beforeEach(t => {
  Fixture.addMainContainers()
  CanvasEvent.addEvents()
  CanvasTextOverlayEvent.addEvents()
})

test.afterEach(t => {
  document.body.innerHTML = ''
  CanvasEvent.removeEvents()
  CanvasTextOverlayEvent.removeEvents()
})

test.serial('ignoreElementEvent', t => {
  t.pass() // can't really test this method
})

test.serial('mouseoverHideMediaControlsEvent and out on video', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'video'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  const video = canvas.getElementsByClassName('video')[0]
  video.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true }))
  t.true(video.hasAttributeNS(null, 'data-ss-controls'))
  t.false(video.hasAttributeNS(null, 'controls'))

  video.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, cancelable: true }))
  t.true(video.hasAttributeNS(null, 'controls'))
})

test.serial('mouseoverHideMediaControlsEvent and out on audio', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'audio'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  const audio = canvas.getElementsByClassName('audio')[0]
  audio.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true }))
  const audioElem = audio.children[0]
  t.true(audioElem.hasAttributeNS(null, 'data-ss-controls'))
  t.false(audioElem.hasAttributeNS(null, 'controls'))

  audio.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, cancelable: true }))
  t.true(audioElem.hasAttributeNS(null, 'controls'))
})

test.serial('clickSelectElementEvent on block', t => {
  const canvas = document.getElementById('canvas')
  const overlay = document.getElementById('element-overlay')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  const block = canvas.getElementsByClassName('block')[0]
  block.style.width = '100px'
  block.style.height = '46px'

  // deselect first, because the block creation already selected it and because the width/height is 0 on creation, the overlay is hidden
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  block.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  t.is(canvas.dataset.selectedElement, block.id)
  t.true(block.classList.contains('selected'))
  t.is(overlay.getElementsByClassName('element-overlay-container')[0].className, 'element-overlay-container container')
})

test.serial('clickSelectElementEvent on small width block', t => {
  const canvas = document.getElementById('canvas')
  const overlay = document.getElementById('element-overlay')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  const block = canvas.getElementsByClassName('block')[0]
  block.style.width = '45px'
  block.style.height = '100px'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })) // canvas deselect
  block.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  t.is(canvas.dataset.selectedElement, block.id)
  t.true(block.classList.contains('selected'))
  t.is(overlay.getElementsByClassName('element-overlay-container')[0].className, 'element-overlay-container small-width container')
})

test.serial('clickSelectElementEvent on small height block', t => {
  const canvas = document.getElementById('canvas')
  const overlay = document.getElementById('element-overlay')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  const block = canvas.getElementsByClassName('block')[0]
  block.style.width = '100px'
  block.style.height = '45px'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })) // canvas deselect
  block.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  t.is(canvas.dataset.selectedElement, block.id)
  t.true(block.classList.contains('selected'))
  t.is(overlay.getElementsByClassName('element-overlay-container')[0].className, 'element-overlay-container small-height container')
})

test.serial('clickSelectElementEvent on text', t => {
  const canvas = document.getElementById('canvas')
  const overlay = document.getElementById('element-overlay')
  canvas.dataset.tool = 'text'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  const text = canvas.getElementsByClassName('text')[0]
  text.style.width = '100px'
  text.style.height = '46px'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })) // canvas deselect
  text.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  t.is(canvas.dataset.selectedElement, text.id)
  t.true(text.classList.contains('selected'))
  t.is(overlay.getElementsByClassName('element-overlay-container')[0].className, 'element-overlay-container')
})

test.serial('clickSelectElementEvent on small text', t => {
  const canvas = document.getElementById('canvas')
  const overlay = document.getElementById('element-overlay')
  canvas.dataset.tool = 'text'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  const text = canvas.getElementsByClassName('text')[0]
  text.style.width = '100px'
  text.style.height = '45px'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })) // canvas deselect
  text.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  t.is(canvas.dataset.selectedElement, text.id)
  t.true(text.classList.contains('selected'))
  t.is(overlay.getElementsByClassName('element-overlay-container')[0].className, 'element-overlay-container small-height')
})

test.serial('clickDeselectCanvasEvent on canvas', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  const block = canvas.getElementsByClassName('block')[0]
  block.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  t.false(canvas.hasAttributeNS(null, 'data-selected-element'))
  t.false(block.classList.contains('selected'))
})

test.serial('clickDeselectCanvasEvent on same block', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  const block = canvas.getElementsByClassName('block')[0]
  block.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  block.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  t.is(canvas.dataset.selectedElement, block.id)
  t.true(block.classList.contains('selected'))
})

test.serial('clickDeselectCanvasEvent on different block', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  const block1 = canvas.getElementsByClassName('block')[1] // the order is reversed
  const block2 = canvas.getElementsByClassName('block')[0]
  canvas.dataset.tool = 'block'
  block1.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  block2.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  t.is(canvas.dataset.selectedElement, block2.id)
  t.false(block1.classList.contains('selected'))
  t.true(block2.classList.contains('selected'))
})

test.serial('clickSelectElementEvent on text inline element', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'text'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  const element = canvas.children[0]
  element.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }))

  // select the "en" text
  const range = document.createRange()
  range.setStart(element.firstChild, 1)
  range.setEnd(element.firstChild, 3)
  window.getSelection().removeAllRanges()
  window.getSelection().addRange(range)
  t.is(window.getSelection().toString(), 'En')

  // make the "en" text bold
  element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  const overlay = document.getElementById('text-overlay')
  overlay.querySelector('.text-overlay-button[value="b"]').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // select the bold element
  canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }))
  const bold = element.children[0]
  bold.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  t.true(bold.classList.contains('selected'))
})
