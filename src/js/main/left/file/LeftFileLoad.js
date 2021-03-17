import HelperCanvas from '../../../helper/HelperCanvas.js'
import StyleSheetFile from '../../../state/stylesheet/StyleSheetFile.js'
import HelperProject from '../../../helper/HelperProject.js'
import HelperTrigger from '../../../helper/HelperTrigger.js'

export default {
  async loadFile (file) {
    const data = await window.electron.invoke('rendererParseHtmlCssFile', file)
    if (!data) return
    this.loadHtml(data.html)
    this.loadCss(data.css)
    HelperProject.setFile(file)
    HelperProject.setFileMeta(data.html.meta)
    HelperProject.setFontList(data.font)
    HelperTrigger.triggerClear('right-panel-style')
  },

  loadHtml (html) {
    HelperCanvas.getCanvas().innerHTML = html.canvas
    document.getElementById('datalist').innerHTML = html.datalist
  },

  loadCss (css) {
    StyleSheetFile.reloadStyle(css)
  }
}
