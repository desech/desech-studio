import Zip from '../../file/Zip.js'
import File from '../../file/File.js'
import ImportCommon from '../ImportCommon.js'

export default {
  _data: {},
  _settings: {},

  // params = type, folder, file, token, settings
  async getImportData (params) {
    this.init(params)
    this._settings.importFolder = Zip.unzipFileTmp(params.file)
    this.parseFiles()
    await this.parseNodes()
    return this._data
  },

  init (params) {
    this._data = {}
    this._settings = {
      ...params,
      importFolder: null,
      // ImportCommon.getImageName() uses this
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
    for (const file of Object.values(this.data)) {
      const filePath = `artwork/${file.path}/graphics/graphicContent.agc`
      const data = File.getFileData(filePath, this._settings.importFolder)
      this._css.element[file.ref] = await this.getCssProperties({ ...file, type: 'block' }, {
        ...data.children[0],
        'uxdesign#bounds': {
          width: file.width,
          height: file.height
        }
      })
      const children = data.children[0].artboard.children
      this._svgData = await AdobexdIcon.prepareSvgData(children)
      await this.parseElements(children, this.data[file.name].nodes, this.data[file.name])
    }
  }
}
