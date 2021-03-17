import test from 'ava'
import Fixture from '../../../../Fixture.js'
import Template from '../../../../../lib/Template.js'
import HelperDOM from '../../../../../js/helper/HelperDOM.js'
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

test.serial('changeCreatePropertyEvent on select change-style value', t => {
  const select = document.getElementsByClassName('add-css-dropdown')[0]
  select.value = 'position'
  select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))

  const list = document.getElementsByClassName('style-css-list')[0]
  t.is(list.children.length, 1)
  t.is(list.children[0].getElementsByClassName('style-css-elem-property')[0].textContent, 'position')
  const valueContainer = list.children[0].getElementsByClassName('style-css-elem-value')[0]
  t.is(valueContainer.children.length, 1)
  t.is(valueContainer.children[0].tagName, 'SELECT')
  t.is(valueContainer.children[0].name, 'position')
  t.is(valueContainer.children[0].value, 'absolute')
  t.is(select.value, '')
  t.is(StateStyleSheet.getPropertyValue('position'), 'absolute')
})

test.serial('changeCreatePropertyEvent on multiple values (same value)', t => {
  const select = document.getElementsByClassName('add-css-dropdown')[0]
  select.value = 'position'
  select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))
  select.value = 'position'
  select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))

  t.is(document.getElementsByClassName('style-css-list')[0].children.length, 2)
  t.is(StateStyleSheet.getPropertyValue('position'), 'absolute') // this should be overwritten on the 2nd time
})

test.serial('changeCreatePropertyEvent on -webkit value', t => {
  const select = document.getElementsByClassName('add-css-dropdown')[0]
  select.value = '-webkit-appearance'
  select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))

  const list = document.getElementsByClassName('style-css-list')[0]
  t.is(list.children.length, 1)
  t.is(list.children[0].getElementsByClassName('style-css-elem-property')[0].textContent, 'appearance')
  const valueContainer = list.children[0].getElementsByClassName('style-css-elem-value')[0]
  t.is(valueContainer.children.length, 1)
  t.is(valueContainer.children[0].tagName, 'SELECT')
  t.is(valueContainer.children[0].name, '-webkit-appearance')
  t.is(valueContainer.children[0].value, 'none')
  t.is(select.value, '')
  t.is(StateStyleSheet.getPropertyValue('-webkit-appearance'), 'none')
})

test.serial('changeCreatePropertyEvent on input unit change-style value', t => {
  const select = document.getElementsByClassName('add-css-dropdown')[0]
  select.value = 'min-width'
  select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))

  const list = document.getElementsByClassName('style-css-list')[0]
  t.is(list.children.length, 1)
  t.is(list.children[0].getElementsByClassName('style-css-elem-property')[0].textContent, 'min-width')
  const valueContainer = list.children[0].getElementsByClassName('style-css-elem-value')[0]
  t.is(valueContainer.children.length, 1)
  t.is(valueContainer.getElementsByClassName('change-style')[0].name, 'min-width')
  t.is(select.value, '')
  t.is(StateStyleSheet.getPropertyValue('min-width'), '') // the property doesn't exist, since we have no value for  it
})

test.serial('changeCreatePropertyEvent on input change-style value', t => {
  const select = document.getElementsByClassName('add-css-dropdown')[0]
  select.value = 'z-index'
  select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))

  const list = document.getElementsByClassName('style-css-list')[0]
  t.is(list.children.length, 1)
  t.is(list.children[0].getElementsByClassName('style-css-elem-property')[0].textContent, 'z-index')
  const valueContainer = list.children[0].getElementsByClassName('style-css-elem-value')[0]
  t.is(valueContainer.children.length, 1)
  t.is(valueContainer.getElementsByClassName('change-style')[0].name, 'z-index')
  t.is(select.value, '')
  t.is(StateStyleSheet.getPropertyValue('z-index'), '') // the property doesn't exist, since we have no value for it
})

test.serial('changeCreatePropertyEvent on color picker change style value', t => {
  const select = document.getElementsByClassName('add-css-dropdown')[0]
  select.value = 'outline-color'
  select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))

  const list = document.getElementsByClassName('style-css-list')[0]
  t.is(list.children.length, 1)
  t.is(list.children[0].getElementsByClassName('style-css-elem-property')[0].textContent, 'outline-color')
  const valueContainer = list.children[0].getElementsByClassName('style-css-elem-value')[0]
  t.is(valueContainer.children.length, 1)
  t.is(valueContainer.getElementsByClassName('change-style')[0].name, 'outline-color')
  t.is(valueContainer.getElementsByClassName('change-style')[0].value, 'rgb(0, 0, 0)')
  t.is(select.value, '')
  t.is(StateStyleSheet.getPropertyValue('outline-color'), 'rgb(0, 0, 0)')
})

test.serial('changeCreatePropertyEvent on custom property', t => {
  const select = document.getElementsByClassName('add-css-dropdown')[0]
  select.value = 'custom'
  select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))

  const list = document.getElementsByClassName('style-css-list')[0]
  t.is(list.children.length, 1)
  t.is(list.children[0].getElementsByClassName('css-property')[0].tagName, 'INPUT')
  t.is(list.children[0].getElementsByClassName('change-style')[0].name, '')
  t.is(select.value, '')
})

// bugfix: the value template was incorrect
test.serial('changeCreatePropertyEvent on vertical-align', t => {
  const select = document.getElementsByClassName('add-css-dropdown')[0]
  select.value = 'vertical-align'
  select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))

  const list = document.getElementsByClassName('style-css-list')[0]
  t.is(list.children[0].getElementsByClassName('style-css-elem-property')[0].textContent, 'vertical-align')
  const valueContainer = list.children[0].getElementsByClassName('style-css-elem-value')[0]
  t.is(valueContainer.children[0].name, 'vertical-align')
  t.is(valueContainer.children[0].value, 'middle')
  t.is(StateStyleSheet.getPropertyValue('vertical-align'), 'middle')
})

test.serial('clickDeletePropertyEvent', t => {
  const select = document.getElementsByClassName('add-css-dropdown')[0]
  select.value = 'outline-color'
  select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))
  select.value = 'position'
  select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))

  const elements = document.getElementsByClassName('style-css-list')[0].children
  t.is(elements.length, 2)

  elements[0].getElementsByClassName('style-css-delete-button')[0].dispatchEvent(new Event('click', { bubbles: true, cancelable: true }))
  t.is(elements.length, 1)
  t.is(StateStyleSheet.getPropertyValue('outline-color'), '')

  elements[0].getElementsByClassName('style-css-delete-button')[0].dispatchEvent(new Event('click', { bubbles: true, cancelable: true }))
  t.is(elements.length, 0)
})
