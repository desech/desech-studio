import test from 'ava'
import Fixture from '../../Fixture.js'
import CanvasOverlayEvent from '../../../js/component/canvas/overlay/CanvasOverlayEvent.js'
import RightEvent from '../../../js/main/right/RightEvent.js'

test.beforeEach(t => {
  Fixture.addMainContainers()
  CanvasOverlayEvent.addEvents()
  RightEvent.addEvents()
})

test.afterEach(t => {
  document.body.innerHTML = ''
  CanvasOverlayEvent.removeEvents()
  RightEvent.removeEvents()
})

test.serial('clearcontainer', t => {
  const overlay = document.getElementById('element-overlay')
  const sections = document.getElementById('main-style-sections')
  overlay.innerHTML = sections.innerHTML = '<div></div>'

  overlay.dispatchEvent(new CustomEvent('clearcontainer', { bubbles: true, cancelable: true }))
  t.is(overlay.children.length, 0)
  t.is(sections.children.length, 0) // panel cleared
})

test.serial('clearcontainer with panelReload true', t => {
  const overlay = document.getElementById('element-overlay')
  const sections = document.getElementById('main-style-sections')
  overlay.innerHTML = sections.innerHTML = '<div></div>'

  overlay.dispatchEvent(new CustomEvent('clearcontainer', { bubbles: true, cancelable: true, detail: { panelReload: true } }))
  t.is(overlay.children.length, 0)
  t.is(sections.children.length, 0) // panel cleared
})

test.serial('clearcontainer with panelReload false', t => {
  const overlay = document.getElementById('element-overlay')
  const sections = document.getElementById('main-style-sections')
  overlay.innerHTML = sections.innerHTML = '<div></div>'

  overlay.dispatchEvent(new CustomEvent('clearcontainer', { bubbles: true, cancelable: true, detail: { panelReload: false } }))
  t.is(overlay.children.length, 0)
  t.is(sections.children.length, 1) // panel not cleared
})

test.serial('reloadcontainer', t => {
  Fixture.addCanvasSelectedElement('video')
  Fixture.addStylePanels()
  const overlay = document.getElementById('element-overlay')
  const sections = document.getElementById('main-style-sections')
  overlay.innerHTML = sections.innerHTML = '<div class="test"></div>'

  overlay.dispatchEvent(new CustomEvent('reloadcontainer', { bubbles: true, cancelable: true }))
  t.is(overlay.getElementsByClassName('test').length, 0)
  t.is(sections.getElementsByClassName('test').length, 0) // panel reloaded
})

test.serial('reloadcontainer with panelReload true', t => {
  Fixture.addCanvasSelectedElement('video')
  Fixture.addStylePanels()
  const overlay = document.getElementById('element-overlay')
  const sections = document.getElementById('main-style-sections')
  overlay.innerHTML = sections.innerHTML = '<div class="test"></div>'

  overlay.dispatchEvent(new CustomEvent('reloadcontainer', { bubbles: true, cancelable: true, detail: { panelReload: true } }))
  t.is(overlay.getElementsByClassName('test').length, 0)
  t.is(sections.getElementsByClassName('test').length, 0) // panel reloaded
})

test.serial('reloadcontainer with panelReload false', t => {
  Fixture.addCanvasSelectedElement('audio') // audio has fewer panels
  Fixture.addStylePanels()
  const overlay = document.getElementById('element-overlay')
  const sections = document.getElementById('main-style-sections')
  overlay.innerHTML = sections.innerHTML = '<div class="test"></div>'

  overlay.dispatchEvent(new CustomEvent('reloadcontainer', { bubbles: true, cancelable: true, detail: { panelReload: false } }))
  t.is(overlay.getElementsByClassName('test').length, 0)
  t.is(sections.getElementsByClassName('test').length, 1) // panel not reloaded
})
