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

test.serial('mousemoveCreateElementEvent on empty canvas', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'

  canvas.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, clientY: 0 }))
  t.is(canvas.getElementsByClassName('placement').length, 0)
})

test.serial('mousemoveCreateElementEvent on container', t => {
  const canvas = document.getElementById('canvas')
  canvas.innerHTML += '<div id="e1" class="element block" style="height: 100px;"></div>'
  canvas.dataset.tool = 'block'

  const elem = document.getElementById('e1')
  elem.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, clientY: 50 }))
  t.is(elem.className, 'element block placement inside')
})

test.serial('mousemoveCreateElementEvent on filled canvas', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  // margin-top is offsetTop, so calculate the total like it's absolute
  canvas.innerHTML += `<div id="e1" class="element block" style="height: 120px; margin-top: 10px;">
    <div id="e11" class="element block" style="height: 50px; margin-top: 20px;"></div>
    <p id="e12" class="element text" style="height: 50px; margin-top: 80px;">{{#i18n}} Enter some text {{/i18n}}</p>
  </div>
  <p id="e2" class="element text" style="height: 100px; margin-top: 140px;">{{#i18n}} Enter some text {{/i18n}}</p>
  <div id="e3" class="element block" style="height: 100px; margin-top: 250px;"></div>`

  canvas.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, clientY: 5 }))
  t.true(document.getElementById('e1').classList.contains('before'))

  canvas.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, cancelable: true }))
  document.getElementById('e11').dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, clientY: 15 }))
  t.true(document.getElementById('e11').classList.contains('before'))

  canvas.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, cancelable: true }))
  document.getElementById('e11').dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, clientY: 40 }))
  t.true(document.getElementById('e11').classList.contains('inside'))

  canvas.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, cancelable: true }))
  document.getElementById('e11').dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, clientY: 60 }))
  t.true(document.getElementById('e11').classList.contains('after'))

  canvas.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, cancelable: true }))
  document.getElementById('e12').dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, clientY: 100 }))
  t.true(document.getElementById('e12').classList.contains('before'))

  canvas.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, cancelable: true }))
  canvas.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, clientY: 360 }))
  t.false(document.getElementById('e3').classList.contains('after'))

  canvas.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, cancelable: true }))
  t.is(canvas.getElementsByClassName('placement').length, 0)
})

test.serial('clickCreateElementEvent block on empty canvas', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'

  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  t.is(canvas.getElementsByClassName('block').length, 1)
})

test.serial('clickCreateElementEvent block on placement before', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.innerHTML += '<div id="previous" class="element block placement before" style="height: 100px; margin-top: 10px;">'

  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  t.is(canvas.children.length, 2)
  t.is(canvas.children[1].id, 'previous')
})

test.serial('clickCreateElementEvent block on placement after', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.innerHTML += '<div id="previous" class="element block placement after" style="height: 100px; margin-top: 10px;">'

  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  t.is(canvas.children.length, 2)
  t.is(canvas.children[0].id, 'previous')
})

test.serial('clickCreateElementEvent block on placement inside', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.innerHTML += '<div id="previous" class="element block placement inside" style="height: 100px; margin-top: 10px;">'

  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  t.is(canvas.children.length, 1)
  t.is(canvas.children[0].id, 'previous')
  t.is(canvas.children[0].children.length, 1)
})

test.serial('clickCreateElementEvent text on empty canvas', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'text'

  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  t.is(canvas.getElementsByClassName('text').length, 1)
})

test.serial('clickCreateElementEvent button on empty canvas', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'button'

  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  t.is(canvas.getElementsByClassName('button').length, 1)
})

test.serial('clickCreateElementEvent icon on empty canvas', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'icon'

  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  t.is(canvas.getElementsByClassName('icon').length, 1)
})

test.serial('clickCreateElementEvent image on empty canvas', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'image'

  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  t.is(canvas.getElementsByClassName('image').length, 1)
})

test.serial('clickCreateElementEvent video on empty canvas', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'video'

  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  t.is(canvas.getElementsByClassName('video').length, 1)
})

test.serial('clickCreateElementEvent audio on empty canvas', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'audio'

  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  t.is(canvas.getElementsByClassName('audio').length, 1)
})

test.serial('clickCreateElementEvent input on empty canvas', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'input'

  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  t.is(canvas.getElementsByClassName('input').length, 1)
})

test.serial('clickCreateElementEvent dropdown on empty canvas', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'dropdown'

  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  t.is(canvas.getElementsByClassName('dropdown').length, 1)
})

test.serial('clickCreateElementEvent textarea on empty canvas', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'textarea'

  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  t.is(canvas.getElementsByClassName('textarea').length, 1)
})

test.serial('clickCreateElementEvent checkbox on empty canvas', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'checkbox'

  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  t.is(canvas.getElementsByClassName('checkbox').length, 1)
})

test.serial('clickCreateElementEvent range on empty canvas', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'range'

  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  t.is(canvas.getElementsByClassName('range').length, 1)
})

test.serial('clickCreateElementEvent color on empty canvas', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'color'

  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  t.is(canvas.getElementsByClassName('color').length, 1)
})

test.serial('clickCreateElementEvent file on empty canvas', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'file'

  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  t.is(canvas.getElementsByClassName('file').length, 1)
})
