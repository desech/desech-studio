import HelperCanvas from '../../../helper/HelperCanvas.js'
import StyleSheetFile from '../../../state/stylesheet/StyleSheetFile.js'
import HelperProject from '../../../helper/HelperProject.js'
import HelperTrigger from '../../../helper/HelperTrigger.js'
import HelperComponent from '../../../helper/HelperComponent.js'
import HelperFile from '../../../helper/HelperFile.js'

export default {
  async loadFile (file) {
    const data = await window.electron.invoke('rendererParseHtmlCssFile', file)
    // @todo try to figure out why on program startup the index page sometimes fails
    // this might still be bypassed by bugs and end up with a blank index.html on first save
    // investigate further
    if (!data || (!HelperFile.isComponentFile(file) && !data.html?.canvas)) {
      HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'file' })
      throw new Error('Failed to load the html page. Please try opening the index.html again')
    }
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
    HelperComponent.setMainData(data.html.component)
  }
}
