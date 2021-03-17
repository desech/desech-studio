import StateStyleSheet from '../js/state/StateStyleSheet.js'
import StateCommandExec from '../js/state/command/StateCommandExec.js'
import Template from '../lib/Template.js'

export default {
  emptyStyleSheets () {
    document.adoptedStyleSheets = []
  },

  addMainContainers () {
    document.body.innerHTML += Template.getHtmlTemplate('./src/html/partial/sidebar/top/history.html') +
      Template.getHtmlTemplate('./src/html/partial/sidebar/left/tool.html') +
      Template.getHtmlTemplate('./src/html/partial/canvas.html') +
      Template.getHtmlTemplate('./src/html/partial/canvas/element.html') +
      Template.getHtmlTemplate('./src/html/partial/canvas/element/overlay.html', {
        partialFiles: ['./src/html/partial/component/input-unit.html']
      }) +
      Template.getHtmlTemplate('./src/html/partial/canvas/element/text-overlay.html') +
      Template.getHtmlTemplate('./src/html/partial/sidebar/right.html')
  },

  addStylePanels () {
    document.body.innerHTML += Template.getHtmlTemplate('./src/html/partial/style.html', {
      partialDir: './src/html/partial/style',
      partialFiles: [
        './src/html/partial/component/input-unit.html',
        './src/html/partial/component/color-picker.html',
        './src/html/partial/component/color-picker/linear-gradient.html',
        './src/html/partial/component/color-picker/radial-gradient.html',
        './src/html/partial/component/color-picker/image.html',
        './src/html/partial/component/color-picker/button.html',
        './src/html/partial/component/timing-function.html'
      ]
    })
  },

  addCanvasSelectedElement (type = 'block') {
    const canvas = document.getElementById('canvas')
    canvas.dataset.selectedElement = 'exx00xx'
    canvas.innerHTML = `<div class="element ${type} selected" id="exx00xx"></div>`

    StateStyleSheet.addSelector(':root', { '': '' })
    StateStyleSheet.initElementStyle('exx00xx')

    StateCommandExec.addColor({
      name: '--color-cxx00xx',
      value: '#FF0000'
    })
  }
}
