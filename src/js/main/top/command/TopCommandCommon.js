import HelperProject from '../../../helper/HelperProject.js'
import StyleSheetFile from '../../../state/stylesheet/StyleSheetFile.js'
import StateHtmlFile from '../../../state/html/StateHtmlFile.js'

export default {
  async executeSaveFile () {
    await window.electron.invoke('rendererSaveCurrentFile', this.getCurrentFileData())
  },

  getCurrentFileData () {
    const folder = HelperProject.getFolder()
    const htmlFile = HelperProject.getFile()
    const css = StyleSheetFile.getStyle()
    const html = StateHtmlFile.getHtml(htmlFile, css)
    return { folder, htmlFile, html, css }
  }
}
