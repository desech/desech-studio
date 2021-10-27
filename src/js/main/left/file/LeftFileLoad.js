import HelperCanvas from '../../../helper/HelperCanvas.js'
import StyleSheetFile from '../../../state/stylesheet/StyleSheetFile.js'
import HelperProject from '../../../helper/HelperProject.js'
import HelperTrigger from '../../../helper/HelperTrigger.js'
import HelperComponent from '../../../helper/HelperComponent.js'
import CanvasElementSelect from '../../canvas/element/CanvasElementSelect.js'

export default {
  async loadFile (file) {
    const data = await window.electron.invoke('rendererParseHtmlCssFile', file)
    console.log('loadFile', data) // @todo remove when fixed
    if (!data) return
    console.log('savingFile') // @todo remove when fixed
    this.loadHtml(data.html)
    this.loadCss(data.css)
    this.setData(file, data)
    CanvasElementSelect.deselectElement()
    HelperTrigger.triggerClear('right-panel-style')
  },

  loadHtml (html) {
    HelperCanvas.getCanvas().innerHTML = html.canvas
  },

  loadCss (css) {
    StyleSheetFile.reloadStyle(css)
  },

  setData (file, data) {
    HelperProject.setFile(file)
    HelperProject.setFileMeta(data.html.meta)
    HelperProject.setFontList(data.font)
    HelperComponent.setMainData(data.html.component)
  },

  async reloadCurrentFile () {
    const file = HelperProject.getFile()
    await this.loadFile(file)
  }
}
