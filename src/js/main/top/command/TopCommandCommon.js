import HelperProject from '../../../helper/HelperProject.js'
import StyleSheetFile from '../../../state/stylesheet/StyleSheetFile.js'
import StateHtmlFile from '../../../state/html/StateHtmlFile.js'
import HelperGlobal from '../../../helper/HelperGlobal.js'

export default {
  async executeSaveFile () {
    await window.electron.invoke('rendererSaveCurrentFile', this.getCurrentFileData())
  },

  getCurrentFileData () {
    const global = HelperGlobal.getGlobal()
    const folder = HelperProject.getFolder()
    const htmlFile = HelperProject.getFile()
    const css = StyleSheetFile.getStyle()
    const html = StateHtmlFile.getHtml(htmlFile, css)
    return { global, folder, htmlFile, html, css }
  }
}
