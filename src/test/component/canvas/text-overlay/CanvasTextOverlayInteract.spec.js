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

test.serial('clickToggleTextOverlayEvent - show the overlay when text is selected', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'text'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  const element = canvas.children[0]
  element.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }))

  const range = document.createRange()
  range.setStart(element.firstChild, 1)
  range.setEnd(element.firstChild, 3)
  window.getSelection().removeAllRanges()
  window.getSelection().addRange(range)
  t.is(window.getSelection().toString(), 'En')

  element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  const overlay = document.getElementById('text-overlay')
  t.is(overlay.children.length, 1)
})

test.serial('clickToggleTextOverlayEvent - show no overlay when no text is selected', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'text'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  const element = canvas.children[0]
  element.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }))

  window.getSelection().removeAllRanges()
  t.is(window.getSelection().toString(), '')

  element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  const overlay = document.getElementById('text-overlay')
  t.is(overlay.children.length, 0)
})

test.serial('keydownHideTextOverlayEvent', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'text'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  const element = canvas.children[0]
  element.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }))

  element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'x' }))
  const overlay = document.getElementById('text-overlay')
  t.is(overlay.children.length, 0)
})

test.serial('clickButtonEvent', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'text'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  const element = canvas.children[0]
  element.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }))

  const range = document.createRange()
  range.setStart(element.firstChild, 1)
  range.setEnd(element.firstChild, 3)
  window.getSelection().removeAllRanges()
  window.getSelection().addRange(range)
  t.is(window.getSelection().toString(), 'En')

  element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  const overlay = document.getElementById('text-overlay')
  overlay.querySelector('.text-overlay-button[value="b"]').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  t.is(overlay.children.length, 0)
  const inline = element.getElementsByClassName('element')[0]
  t.is(inline.tagName, 'B')
  t.is(inline.className, 'element inline')
  t.is(inline.textContent, 'En')
})

test.serial('changeOtherTagsEvent', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'text'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  const element = canvas.children[0]
  element.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }))

  const range = document.createRange()
  range.setStart(element.firstChild, 1)
  range.setEnd(element.firstChild, 3)
  window.getSelection().removeAllRanges()
  window.getSelection().addRange(range)
  t.is(window.getSelection().toString(), 'En')

  element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  const overlay = document.getElementById('text-overlay')

  const select = overlay.getElementsByClassName('text-overlay-select')[0]
  select.value = 'mark'
  select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))
  t.is(overlay.children.length, 0)
  const inline = element.getElementsByClassName('element')[0]
  t.is(inline.tagName, 'MARK')
  t.is(inline.className, 'element inline')
  t.is(inline.textContent, 'En')
})

test.serial('clickClearFormattingEvent', t => {
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

  // select again the "en" text that is now bold
  try {
    const inline = element.getElementsByClassName('element')[0]
    const range2 = document.createRange()
    range2.setStart(inline.firstChild, 0)
    range2.setEnd(inline.firstChild, 2)
    window.getSelection().removeAllRanges()
    window.getSelection().addRange(range2)
  } catch (error) {
    console.error(error)
  }

  // show the overlay
  element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  t.true(overlay.querySelector('.text-overlay-button[value="b"]').classList.contains('inactive'))
  const clear = overlay.querySelector('.text-overlay-clear')
  t.true(clear.classList.contains('inactive'))

  // clear the format
  clear.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  t.is(overlay.children.length, 0)
  t.is(element.innerHTML, ' Enter some text En')
})
