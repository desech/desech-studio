import HelperCanvas from '../../../helper/HelperCanvas.js'
import StyleSheetFile from '../../../state/stylesheet/StyleSheetFile.js'
import HelperProject from '../../../helper/HelperProject.js'
import HelperTrigger from '../../../helper/HelperTrigger.js'
import HelperComponent from '../../../helper/HelperComponent.js'

export default {
  async loadFile (file) {
    const data = await window.electron.invoke('rendererParseHtmlCssFile', file)
    if (!data) return
    this.loadHtml(data.html)
    this.loadCss(data.css)
    this.setData(file, data)
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
    HelperComponent.setComponentMainData(data.html.component)
  }
}
