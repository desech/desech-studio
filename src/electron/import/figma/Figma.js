import FigmaApi from './FigmaApi.js'
import EventMain from '../../event/EventMain.js'
import Language from '../../lib/Language.js'

export default {
  async getImportData (params) {
    const data = await FigmaApi.apiCall(`files/${params.file}?geometry=paths`, params.token)
    EventMain.ipcMainInvoke('mainImportProgress', Language.localize('Parsing started'))
    await this.parsePages(data.document.children)
  },

  async parsePages (pages) {
    for (const page of pages) {
      // ignore empty pages
      if (!page.children.length) continue
      await this.parsePage(page)
    }
  },

  async parsePage (page) {
    const name = ParseCommon.getName(page.name, this._html)
    this._html[name] = { type: 'folder', name, files: {} }
    await this.parseRoot(page.children, this._html[name].files)
    // ignore empty folders
    if (ExtendJS.isEmpty(this._html[name].files)) delete this._html[name]
  }
}
