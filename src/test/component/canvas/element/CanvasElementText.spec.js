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

test.serial('dblclickStartEditEvent and mousedownEndEditEvent', t => {
  const canvas = document.getElementById('canvas')
  for (const tool of ['text', 'button']) {
    canvas.dataset.tool = tool
    canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

    const element = canvas.getElementsByClassName(tool)[0]
    element.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }))
    t.is(canvas.dataset.operation, 'editing')
    t.true(element.classList.contains('editable'))
    t.truthy(element.dataset.textId)
    t.true(element.hasAttributeNS(null, 'contenteditable'))

    canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }))
    t.falsy(canvas.dataset.operation)
    t.false(element.classList.contains('editable'))
    t.falsy(element.dataset.textId)
    t.false(element.hasAttributeNS(null, 'contenteditable'))
  }
})

test.serial('keyupUpdateOverlayEvent', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'text'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // reselect the element so we can resize the overlay
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  const element = canvas.children[0]
  element.style.width = element.style.height = '100px'
  element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // start editing
  element.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }))

  const overlay = document.getElementById('element-overlay')
  element.style.height = '101px'
  element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'x' }))
  t.is(overlay.style.height, element.style.height)
})

test.serial('pasteTextEvent', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'text'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  const element = canvas.children[0]
  element.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }))

  const event = new Event('paste', { bubbles: true, cancelable: true })
  event.clipboardData = {
    getData () { return 'xxx' }
  }
  document.dispatchEvent(event)
  t.is(element.textContent, ' Enter some text xxx')
})

test.serial('keydownButtonSpaceEvent', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'button'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  const element = canvas.children[0]
  element.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }))

  element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, code: 'Space' }))
  t.is(element.innerHTML, ' Button text &nbsp;')
})

test.serial('keydownNewLineEvent', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'text'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  const element = canvas.children[0]
  element.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }))

  element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter' }))
  t.is(element.innerHTML, ' Enter some text <br>')
})

// dblclickSelectWordEvent - can't really test this - https://github.com/jsdom/jsdom/issues/2959

// inputTextEvent, dragstartTextEvent - nothing to test here
