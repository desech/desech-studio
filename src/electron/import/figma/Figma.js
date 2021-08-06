import FigmaApi from './FigmaApi.js'
import Language from '../../lib/Language.js'
import ImportCommon from '../ImportCommon.js'
import FigmaCommon from './FigmaCommon.js'
import FigmaElement from './FigmaElement.js'

export default {
  _data: {},
  _settings: {},

  // params = type, folder, file, token
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
    this._data[name] = { type: 'folder', name, files: {} }
    await this.parseFiles(page.children, this._data[name].files)
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
      await this.parseElement(node, elements, file)
      if (node.children) await this.parseElements(node.children, elements, file)
    }
  },

  async parseElement (node, elements, file) {
    const data = await FigmaElement.getData(node, file, this._settings)
    if (data) elements.push(data)
  }
}
