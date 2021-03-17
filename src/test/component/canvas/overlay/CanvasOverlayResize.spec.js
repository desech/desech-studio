import test from 'ava'
import Fixture from '../../../Fixture.js'
import CanvasEvent from '../../../../js/component/canvas/CanvasEvent.js'
import CanvasOverlayEvent from '../../../../js/component/canvas/overlay/CanvasOverlayEvent.js'

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

test.serial('mousedownEvent/move/up - block resize bottom', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // select the element
  const elem = canvas.getElementsByClassName('element')[0]
  elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // start the resize
  elem.style.width = elem.style.height = '100px'
  const overlay = document.getElementById('element-overlay')
  const button = overlay.querySelector('.resize-size .resize-bottom')
  button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))
  t.is(canvas.dataset.operation, 'resizing')

  // check if we can also move the element
  elem.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }))
  t.is(canvas.dataset.operation, 'resizing')

  // resize
  button.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, buttons: 1, clientX: 0, clientY: 10 }))
  t.is(elem.offsetWidth, 100)
  t.is(elem.offsetHeight, 110)
  t.is(overlay.offsetWidth, 100)
  t.is(overlay.offsetHeight, 110)
  const counter = overlay.querySelector('.resize-size .resize-counter')
  t.is(counter.style.opacity, '1')
  t.is(counter.textContent, '110')

  // resize end
  button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }))
  t.is(canvas.dataset.operation, undefined)
  t.is(counter.style.opacity, '0')
  t.false(elem.hasAttributeNS(null, 'style'))
})

// although we are resizing on both width/height, the events never trigger the sizes at the same time
// sometimes it's x=1,y=0, or x=0,y=1, so in practice, they either scale x or y at one time, never both
test.serial('mousedownEvent/move/up - block resize bottom right', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // select the element
  const elem = canvas.getElementsByClassName('element')[0]
  elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // start the resize
  elem.style.width = elem.style.height = '100px'
  const overlay = document.getElementById('element-overlay')
  const button = overlay.querySelector('.resize-size .resize-se')
  button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))

  // resize
  button.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, buttons: 1, clientX: 10, clientY: 0 }))
  t.is(elem.offsetWidth, 110)
  t.is(elem.offsetHeight, 100)
  t.is(overlay.offsetWidth, 110)
  t.is(overlay.offsetHeight, 100)
  const counter = overlay.querySelector('.resize-size .resize-counter')
  t.is(counter.style.opacity, '') // when scaling both we don't show the counter
  t.is(counter.textContent, '')

  // resize end
  button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }))
})

test.serial('mousedownEvent/move/up - image scalable resize bottom', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'image'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // select the element
  const elem = canvas.getElementsByClassName('element')[0]
  elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // start the resize
  elem.style.width = elem.style.height = '100px'
  const overlay = document.getElementById('element-overlay')
  const button = overlay.querySelector('.resize-size .resize-bottom')
  button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))

  // resize
  button.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, buttons: 1, clientX: 0, clientY: 10 }))
  t.is(elem.offsetWidth, 110)
  t.is(elem.offsetHeight, 110)
  t.is(overlay.offsetWidth, 110)
  t.is(overlay.offsetHeight, 110)
  const counter = overlay.querySelector('.resize-size .resize-counter')
  t.is(counter.style.opacity, '1')
  t.is(counter.textContent, '110')

  // resize end
  button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }))
})

test.serial('mousedownEvent/move/up - block margin bottom', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // select the element
  const elem = canvas.getElementsByClassName('element')[0]
  elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // start the margin resize
  const overlay = document.getElementById('element-overlay')
  const button = overlay.querySelector('.resize-margin .resize-bottom')
  button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))

  // margin resize
  button.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, buttons: 1, clientX: 0, clientY: 10 }))
  t.is(elem.style.marginBottom, '10px')
  t.is(overlay.getElementsByClassName('resize-margin')[0].style.borderBottomWidth, '10px')
  t.is(button.style.bottom, '-18px')
  const counter = overlay.querySelector('.resize-margin .resize-counter')
  t.is(counter.style.opacity, '1')
  t.is(counter.textContent, '10')

  // resize end
  button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }))
  t.is(canvas.dataset.operation, undefined)
  t.is(counter.style.opacity, '0')
  t.false(elem.hasAttributeNS(null, 'style'))
})

test.serial('mousedownEvent/move/up - block margin bottom altkey', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // select the element
  const elem = canvas.getElementsByClassName('element')[0]
  elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // start the margin resize
  const overlay = document.getElementById('element-overlay')
  const button = overlay.querySelector('.resize-margin .resize-bottom')
  button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))

  // margin resize
  button.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, buttons: 1, clientX: 0, clientY: 10, altKey: true }))
  t.is(elem.style.marginBottom, '10px')
  t.is(elem.style.marginTop, '10px')

  const container = overlay.getElementsByClassName('resize-margin')[0]
  t.is(container.style.borderBottomWidth, '10px')
  t.is(container.style.borderTopWidth, '10px')
  t.is(container.style.marginTop, '-10px')
  t.is(button.style.bottom, '-18px')
  t.is(overlay.querySelector('.resize-margin .resize-top').style.top, '-18px')

  const counter = overlay.querySelector('.resize-margin .resize-counter')
  t.is(counter.style.opacity, '1')
  t.is(counter.textContent, '10')

  // resize end
  button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }))
})

test.serial('mousedownEvent/move/up - block margin bottom shiftkey', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // select the element
  const elem = canvas.getElementsByClassName('element')[0]
  elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // start the margin resize
  const overlay = document.getElementById('element-overlay')
  const button = overlay.querySelector('.resize-margin .resize-bottom')
  button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))

  // margin resize
  button.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, buttons: 1, clientX: 0, clientY: 10, shiftKey: true }))
  t.is(elem.style.margin, '10px')

  const container = overlay.getElementsByClassName('resize-margin')[0]
  t.is(container.style.borderBottomWidth, '10px')
  t.is(container.style.borderTopWidth, '10px')
  t.is(container.style.borderLeftWidth, '10px')
  t.is(container.style.borderRightWidth, '10px')
  t.is(container.style.marginTop, '-10px')
  t.is(container.style.marginLeft, '-10px')
  t.is(button.style.bottom, '-18px')
  t.is(overlay.querySelector('.resize-margin .resize-top').style.top, '-18px')
  t.is(overlay.querySelector('.resize-margin .resize-left').style.left, '-18px')
  t.is(overlay.querySelector('.resize-margin .resize-right').style.right, '-18px')

  const counter = overlay.querySelector('.resize-margin .resize-counter')
  t.is(counter.style.opacity, '1')
  t.is(counter.textContent, '10')

  // resize end
  button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }))
})

test.serial('mousedownEvent/move/up - block padding bottom', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // select the element
  const elem = canvas.getElementsByClassName('element')[0]
  elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // start the padding resize
  const overlay = document.getElementById('element-overlay')
  const button = overlay.querySelector('.resize-padding .resize-bottom')
  button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: 0, clientY: 20 }))

  // padding resize
  button.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, buttons: 1, clientX: 0, clientY: 10 }))
  t.is(elem.style.paddingBottom, '10px')
  t.is(overlay.getElementsByClassName('resize-padding')[0].style.borderBottomWidth, '10px')
  const counter = overlay.querySelector('.resize-padding .resize-counter')
  t.is(counter.style.opacity, '1')
  t.is(counter.textContent, '10')

  // resize end
  button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }))
  t.is(canvas.dataset.operation, undefined)
  t.is(counter.style.opacity, '0')
  t.false(elem.hasAttributeNS(null, 'style'))
})

test.serial('mousedownEvent/move/up - block padding bottom altkey', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // select the element
  const elem = canvas.getElementsByClassName('element')[0]
  elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // start the padding resize
  const overlay = document.getElementById('element-overlay')
  const button = overlay.querySelector('.resize-padding .resize-bottom')
  button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: 0, clientY: 20 }))

  // padding resize
  button.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, buttons: 1, clientX: 0, clientY: 10, altKey: true }))
  t.is(elem.style.paddingBottom, '10px')
  t.is(elem.style.paddingTop, '10px')

  const container = overlay.getElementsByClassName('resize-padding')[0]
  t.is(container.style.borderBottomWidth, '10px')
  t.is(container.style.borderTopWidth, '10px')

  const counter = overlay.querySelector('.resize-padding .resize-counter')
  t.is(counter.style.opacity, '1')
  t.is(counter.textContent, '10')

  // resize end
  button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }))
})

test.serial('mousedownEvent/move/up - block padding bottom shiftkey', t => {
  const canvas = document.getElementById('canvas')
  canvas.dataset.tool = 'block'
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // select the element
  const elem = canvas.getElementsByClassName('element')[0]
  elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  // start the padding resize
  const overlay = document.getElementById('element-overlay')
  const button = overlay.querySelector('.resize-padding .resize-bottom')
  button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: 0, clientY: 20 }))

  // padding resize
  button.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, buttons: 1, clientX: 0, clientY: 10, shiftKey: true }))
  t.is(elem.style.padding, '10px')

  const container = overlay.getElementsByClassName('resize-padding')[0]
  t.is(container.style.borderBottomWidth, '10px')
  t.is(container.style.borderTopWidth, '10px')
  t.is(container.style.borderLeftWidth, '10px')
  t.is(container.style.borderRightWidth, '10px')

  const counter = overlay.querySelector('.resize-padding .resize-counter')
  t.is(counter.style.opacity, '1')
  t.is(counter.textContent, '10')

  // resize end
  button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }))
})
