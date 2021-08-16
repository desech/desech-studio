import Zip from '../../file/Zip.js'
import File from '../../file/File.js'
import ImportCommon from '../ImportCommon.js'
import SketchCommon from './SketchCommon.js'
import SketchElement from './SketchElement.js'
import SketchComponent from './SketchComponent.js'

export default {
  _data: {},

  // params = type, folder, file, settings
  async getImportData (params) {
    this.init(params)
    this.parseComponents()
    await this.parseDocument()
    return this._data
  },

  init (params) {
    this._data = {}
    this._settings = {
      ...params,
      importFolder: Zip.unzipFileTmp(params.file),
      components: {},
      // ImportImage.getImageName() uses this
      allImages: {}
    }
  },

  parseComponents () {
    const document = File.getFileData('document.json', this._settings.importFolder)
    for (const page of document.pages) {
      const root = File.getFileData(page._ref + '.json', this._settings.importFolder)
      for (const node of root.layers) {
        if (node._class === 'symbolMaster') {
          this._settings.components[node.symbolID] = node
        }
      }
    }
  },

  async parseDocument () {
    const document = File.getFileData('document.json', this._settings.importFolder)
    for (const page of document.pages) {
      await this.parsePage(page._ref + '.json')
    }
  },

  async parsePage (file) {
    const page = File.getFileData(file, this._settings.importFolder)
    if (!page.layers.length) return
    const name = ImportCommon.getName(page.name, this._data)
    this._data[name] = { type: 'folder', name, files: {} }
    await this.parseFiles(page.layers, this._data[name].files)
  },

  async parseFiles (layers, files) {
    for (const node of layers) {
      // we ignore non containers, hidden artboards and master symbols
      if (!node.layers?.length || !node.isVisible || node._class === 'symbolMaster') {
        continue
      }
      const name = ImportCommon.getName(node.name, files)
      files[name] = this.getFileData(node, name)
      await SketchElement.addStyle(files[name], node, this._settings)
      await this.parseElements(node.layers, files[name].elements)
    }
  },

  getFileData (artboard, name) {
    return {
      type: 'file',
      name,
      width: SketchCommon.getWidth('block', artboard),
      height: SketchCommon.getHeight('block', artboard),
      style: {},
      elements: []
    }
  },

  async parseElements (nodes, elements, parent = null, currentPos = null) {
    const newPos = SketchElement.getPos(parent, currentPos)
    for (const node of nodes) {
      const data = await SketchElement.getData(node, parent, newPos, this._settings)
      if (!data) continue
      elements.push(data)
      await this.parseChildren(data, node, elements, newPos)
    }
  },

  async parseChildren (data, node, elements, newPos) {
    if (data.desechType === 'icon') return
    const componentChildren = SketchComponent.getChildren(node, this._settings.components)
    const children = componentChildren || node.layers
    if (!children) return
    await this.parseElements(children, elements, node, newPos)
  }
}
