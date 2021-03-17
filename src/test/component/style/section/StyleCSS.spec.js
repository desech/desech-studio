import test from 'ava'
import RightCSS from '../../../../js/main/right/section/RightCSS.js'
import Fixture from '../../../Fixture.js'
import Template from '../../../../lib/Template.js'
import RightCommon from '../../../../js/main/right/RightCommon.js'

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
})

test.afterEach(t => {
  Fixture.emptyStyleSheets()
  document.body.innerHTML = ''
})

test.serial('getSection empty', t => {
  const section = RightCSS.getSection()
  document.body.appendChild(section)
  t.is(section.getElementsByClassName('style-css-list')[0].children.length, 1) // block has the min-height custom property by default
})

test.serial('getSection full', t => {
  RightCommon.changeStyle({
    float: 'right', // select
    '-webkit-appearance': 'button', // -webkit-
    'min-width': '100%', // input unit
    'border-inline-start': 'solid', // input custom
    'outline-color': 'rgb(0, 255, 0)', // color
    widows: '3' // custom property
  })

  const section = RightCSS.getSection()
  document.body.appendChild(section)
  t.is(section.getElementsByClassName('style-css-list')[0].children.length, 7) // plus the min-height property
})
