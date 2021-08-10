import Zip from '../../file/Zip.js'
import File from '../../file/File.js'
import ImportCommon from '../ImportCommon.js'
import AdobexdElement from './AdobexdElement.js'

export default {
  _data: {},
  _settings: {},

  // params = type, folder, file, token, settings
  async getImportData (params) {
    this.init(params)
    this.parseFiles()
    await this.parseNodes()
    return this._data
  },

  init (params) {
    this._data = {}
    this._settings = {
      ...params,
      importFolder: Zip.unzipFileTmp(params.file),
      // ImportImage.getImageName() uses this
      allImages: {}
    }
  },

  parseFiles () {
    const manifest = File.getFileData('manifest', this._settings.importFolder)
    for (const artboard of manifest.children[0].children) {
      if (artboard.name === 'pasteboard') continue
      const name = ImportCommon.getName(artboard.name, this._data)
      this._data[name] = this.getFile(artboard, name)
    }
  },

  getFile (element, name) {
    const bounds = element['uxdesign#bounds']
    return {
      type: 'file',
      path: element.path,
      name,
      x: Math.round(bounds.x),
      y: Math.round(bounds.y),
      width: Math.round(bounds.width),
      height: Math.round(bounds.height),
      elements: []
    }
  },

  async parseNodes () {
    for (const file of Object.values(this._data)) {
      const filePath = `artwork/${file.path}/graphics/graphicContent.agc`
      const data = File.getFileData(filePath, this._settings.importFolder)
      const children = data.children[0].artboard.children
      await this.parseElements(children, this._data[file.name].elements, this._data[file.name])
    }
  },

  async parseElements (nodes, elements, artboard, parent = null, currentPos = null) {
    const newPos = AdobexdElement.getPos(artboard, parent, currentPos)
    for (const node of nodes) {
      const data = await AdobexdElement.getData(node, newPos, this._settings)
      if (!data) continue
      elements.push(data)
      if (data.desechType !== 'icon' && node.group?.children) {
        // skip children for icons; this also processes symbols
        await this.parseElements(node.group.children, elements, artboard, node, newPos)
      }
    }
  }
}
