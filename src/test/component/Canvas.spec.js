import test from 'ava'
import Fixture from '../Fixture.js'
import CanvasEvent from '../../js/component/canvas/CanvasEvent.js'
import HelperDOM from '../../js/helper/HelperDOM.js'

test.beforeEach(t => {
  Fixture.addMainContainers()
  CanvasEvent.addEvents()
})

test.afterEach(t => {
  document.body.innerHTML = ''
  CanvasEvent.removeEvents()
})

test.serial('clickPanelButtonEvent', t => {
  // trigger the event on the svg so we test the click event selector too
  document.querySelector('.tool-button[data-type="block"] svg').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  t.false(document.querySelector('.tool-button[data-type="select"]').classList.contains('inactive'))
  t.true(document.querySelector('.tool-button[data-type="block"]').classList.contains('inactive'))
  t.is(document.getElementById('canvas').dataset.tool, 'block')
})

test.serial('clickPanelButtonListEvent', t => {
  // trigger the event on the svg so we test the click event selector too
  document.querySelector('.tool-button-list-elem[data-type="video"] svg').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  const videoButton = document.querySelector('.tool-button[data-type="video"]')
  t.false(HelperDOM.isVisible(document.querySelector('.tool-button[data-type="image"]')))
  t.true(HelperDOM.isVisible(videoButton))
  t.true(videoButton.classList.contains('inactive'))
  t.is(document.getElementById('canvas').dataset.tool, 'video')
})

test.serial('keydownPanelButtonEvent', t => {
  const canvas = document.getElementById('canvas')

  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'v' }))
  t.is(canvas.dataset.tool, 'select')

  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'r' }))
  t.is(canvas.dataset.tool, 'block')

  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 't' }))
  t.is(canvas.dataset.tool, 'text')

  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'b' }))
  t.is(canvas.dataset.tool, 'button')

  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 's' }))
  t.is(canvas.dataset.tool, 'icon')

  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'i' }))
  t.is(canvas.dataset.tool, 'image')

  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'w' }))
  t.is(canvas.dataset.tool, 'video')

  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'a' }))
  t.is(canvas.dataset.tool, 'audio')

  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'p' }))
  t.is(canvas.dataset.tool, 'input')

  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'd' }))
  t.is(canvas.dataset.tool, 'dropdown')

  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'x' }))
  t.is(canvas.dataset.tool, 'textarea')

  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'k' }))
  t.is(canvas.dataset.tool, 'checkbox')

  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'n' }))
  t.is(canvas.dataset.tool, 'range')

  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'c' }))
  t.is(canvas.dataset.tool, 'color')

  canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'f' }))
  t.is(canvas.dataset.tool, 'file')
})
