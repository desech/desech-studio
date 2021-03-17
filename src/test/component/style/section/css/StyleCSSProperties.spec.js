import test from 'ava'
import Template from '../../../../../lib/Template.js'
import HelperDOM from '../../../../../js/helper/HelperDOM.js'
import Fixture from '../../../../Fixture.js'
import StateStyleSheet from '../../../../../js/state/StateStyleSheet.js'
import ComponentEvent from '../../../../../js/component/ComponentEvent.js'
import RightCSSEvent from '../../../../../js/main/right/section/css/RightCSSEvent.js'

test.beforeEach(t => {
  Fixture.addMainContainers()
  Fixture.addCanvasSelectedElement()
  document.body.innerHTML += Template.getHtmlTemplate('./src/html/partial/style/css.html', {
    partialFiles: [
      './src/html/partial/style/css/select.html',
      './src/html/partial/style/css/value.html',
      './src/html/partial/component/color-picker/button.html',
      './src/html/partial/component/input-unit.html'
    ]
  }) + Template.getHtmlTemplate('./src/html/partial/component/color-picker/template.html', {
    partialFiles: ['./src/html/partial/component/color-picker.html']
  })
  document.body.appendChild(HelperDOM.getTemplate('template-style-css'))
  ComponentEvent.addEvents()
  RightCSSEvent.addEvents()
})

test.afterEach(t => {
  Fixture.emptyStyleSheets()
  document.body.innerHTML = ''
  ComponentEvent.removeEvents()
  RightCSSEvent.removeEvents()
})

test.serial('inputUpdateCustomPropertyEvent', t => {
  const select = document.getElementsByClassName('add-css-dropdown')[0]
  select.value = 'custom'
  select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))

  const propertyName = document.getElementsByClassName('css-property')[0]
  const propertyValue = document.getElementsByClassName('change-style')[0]
  propertyName.value = 'widows'
  propertyValue.value = '3'
  propertyName.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }))

  t.is(propertyValue.name, 'widows')
  t.is(StateStyleSheet.getPropertyValue('widows'), '3')
})

test.serial('clickToggleColorPickerEvent', t => {
  const select = document.getElementsByClassName('add-css-dropdown')[0]
  select.value = 'outline-color'
  select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))

  const buttonContainer = document.getElementsByClassName('style-css-color-button')[0]
  buttonContainer.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }))

  t.true(buttonContainer.children[0].classList.contains('active'))
  const picker = document.getElementsByClassName('color-picker')[0]
  t.is(picker.getElementsByClassName('color-hex-input')[0].value, '000000')
  t.is(picker.getElementsByClassName('swatch-color')[0].dataset.value, '#FF0000')
})

test.serial('colorChangeUpdateValueEvent', t => {
  const select = document.getElementsByClassName('add-css-dropdown')[0]
  select.value = 'outline-color'
  select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))

  const buttonContainer = document.getElementsByClassName('style-css-color-button')[0]
  buttonContainer.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }))
  const picker = document.getElementsByClassName('color-picker')[0]
  picker.getElementsByClassName('color-rgb-input')[1].value = 255
  picker.dispatchEvent(new CustomEvent('colorchange', { bubbles: true, cancelable: true, detail: {} }))

  t.is(document.getElementsByClassName('color-button')[0].style.backgroundColor, 'rgb(0, 255, 0)')
  t.is(document.getElementsByClassName('change-style')[0].value, 'rgb(0,255,0)')
  t.is(StateStyleSheet.getPropertyValue('outline-color'), 'rgb(0,255,0)')

  // close and reopen the color picker so we can pre-fill the color
  buttonContainer.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }))
  buttonContainer.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }))

  t.is(document.getElementsByClassName('color-hex-input')[0].value, '00FF00')
})
