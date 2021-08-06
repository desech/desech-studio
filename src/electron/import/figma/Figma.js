import FigmaApi from './FigmaApi.js'
import Language from '../../lib/Language.js'
import ImportCommon from '../ImportCommon.js'
import FigmaCommon from './FigmaCommon.js'
import FigmaElement from './FigmaElement.js'
import ExtendJS from '../../../js/helper/ExtendJS.js'

export default {
  _data: {},
  _settings: {},

  // params = type, folder, file, token, settings
  async getImportData (params) {
    this.setSettings(params)
    const data = await FigmaApi.apiCall(`files/${params.file}?geometry=paths`, params.token)
    FigmaCommon.sendProgress(Language.localize('Parsing started'))
    await this.parsePages(data.document.children)
    return this._data
  },

  setSettings (params) {
    this._settings = {
      ...params,
      // ImportCommon.getImageName() uses this
      allImages: {}
    }
  },

  async parsePages (pages) {
    for (const page of pages) {
      if (page.children?.length) await this.parsePage(page)
    }
  },

  async parsePage (page) {
    const name = ImportCommon.getName(page.name, this._data)
    const folder = { type: 'folder', name, files: {} }
    await this.parseFiles(page.children, folder.files)
    if (!ExtendJS.isEmpty(folder.files)) this._data[name] = folder
  },

  async parseFiles (nodes, files) {
    for (const node of nodes) {
      // we ignore non containers
      if (!node.children?.length) continue
      const name = ImportCommon.getName(node.name, files)
      const file = this.getFileData(node, name)
      files[name] = file
      await this.parseElements(node.children, file.elements, file)
    }
  },

  getFileData (node, name) {
    return {
      type: 'file',
      name,
      x: Math.round(node.absoluteBoundingBox.x),
      y: Math.round(node.absoluteBoundingBox.y),
      width: FigmaCommon.getWidth('block', node),
      height: FigmaCommon.getHeight('block', node),
      elements: []
    }
  },

  async parseElements (nodes, elements, file) {
    for (const node of nodes) {
      const data = await FigmaElement.getData(node, file, this._settings)
      if (!data) continue
      elements.push(data)
      // don't fetch anything inside elements with export settings
      if (!node.children || node.exportSettings?.length) continue
      await this.parseElements(node.children, elements, file)
    }
  }
}
