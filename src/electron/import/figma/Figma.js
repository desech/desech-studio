import FigmaApi from './FigmaApi.js'
import ImportCommon from '../ImportCommon.js'
import FigmaCommon from './FigmaCommon.js'
import FigmaElement from './FigmaElement.js'

export default {
  _data: {},
  _settings: {},

  // params = type, folder, file, token, settings
  async getImportData (params) {
    this.init(params)
    const data = await FigmaApi.apiCall(`files/${params.file}?geometry=paths`, params.token)
    await this.parsePages(data.document.children)
    return this._data
  },

  init (params) {
    this._data = {}
    this._settings = {
      ...params,
      // ImportImage.getImageName() uses this
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
    this._data[name] = { type: 'folder', name, files: {} }
    await this.parseFiles(page.children, this._data[name].files)
  },

  async parseFiles (nodes, files) {
    for (const node of nodes) {
      // we ignore non containers and hidden artboards
      if (!node.children?.length || node.visible === false) continue
      const name = ImportCommon.getName(node.name, files)
      files[name] = this.getFileData(node, name)
      FigmaElement.addStyle(files[name], node, this._settings)
      await this.parseElements(node.children, files[name].elements, files[name])
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
      style: {},
      elements: []
    }
  },

  async parseElements (nodes, elements, file) {
    for (const node of nodes) {
      const data = await FigmaElement.getData(node, file, this._settings)
      if (!data) continue
      elements.push(data)
      // don't fetch the children of elements with export settings
      if (!node.children || node.exportSettings?.length) continue
      await this.parseElements(node.children, elements, file)
    }
  }
}
