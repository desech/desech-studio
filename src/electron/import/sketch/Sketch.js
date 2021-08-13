import Zip from '../../file/Zip.js'
import File from '../../file/File.js'
import ImportCommon from '../ImportCommon.js'
import SketchCommon from './SketchCommon.js'
import SketchElement from './SketchElement.js'

export default {
  _data: {},

  // params = type, folder, file, settings
  async getImportData (params) {
    this.init(params)
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
      // we ignore non containers, hidden artboards and master symbols from the Components page
      if (!node.layers?.length || !node.isVisible || node._class === 'symbolMaster') {
        continue
      }
      const name = ImportCommon.getName(node.name, files)
      files[name] = this.getFileData(node, name)
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
      if (node.layers && data.designType !== 'shapegroup') {
        // shapeGroup children are processed in the svg icon
        await this.parseElements(node.layers, elements, node, newPos)
      }
    }
  }
}
