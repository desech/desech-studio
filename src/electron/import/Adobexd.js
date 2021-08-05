import ParseCommon from './ParseCommon.js'
import HelperElement from '../../js/helper/HelperElement.js'
import AdobexdCommon from './adobexd/AdobexdCommon.js'
import AdobexdFill from './adobexd/AdobexdFill.js'
import AdobexdStroke from './adobexd/AdobexdStroke.js'
import AdobexdEffect from './adobexd/AdobexdEffect.js'
import AdobexdText from './adobexd/AdobexdText.js'
import AdobexdInline from './adobexd/AdobexdInline.js'
import AdobexdIcon from './adobexd/AdobexdIcon.js'
import Zip from '../file/Zip.js'
import File from '../file/File.js'
import ExtendJS from '../../js/helper/ExtendJS.js'

export default {
  _html: {},
  _css: {},
  _debug: [],
  _svgData: {},
  _symbols: {},
  _projectFolder: '',
  _importFolder: '',
  _zIndex: 0,
  _processImages: {},

  async getImportData (file, projectFolder) {
    this.reset(projectFolder)
    await ParseCommon.prepareProjectFolder(projectFolder)
    this._importFolder = Zip.unzipFileTmp(file)
    this.parseComponents()
    this.parseFiles()
    await this.parseNodes()
    return {
      html: this._html,
      css: this._css,
      debug: this._debug
    }
  },

  reset (projectFolder) {
    this._html = {}
    this._debug = []
    this._symbols = {}
    this._zIndex = 0
    this._projectFolder = projectFolder
    this._processImages = {}
    this._css = {
      font: [],
      component: {},
      element: {}
    }
  },

  parseComponents () {
    const data = File.getFileData('resources/graphics/graphicContent.agc', this._importFolder)
    this.parseSymbols(data)
    this.parseStyles(data)
  },

  parseSymbols (data) {
    for (const element of data.resources.meta.ux.symbols) {
      // same with Figma, symbols can be drastically changed, so we can't have css components
      this._symbols[element.meta.ux.symbolId] = element
    }
  },

  parseStyles (data) {
    // we can't create color components (colors) because we don't know the element type to
    // apply to; we can't create text components (character styles) because they are not
    // attached to anything
    // data.resources.meta.ux.documentLibrary.elements
  },

  parseFiles () {
    const manifest = File.getFileData('manifest', this._importFolder)
    for (const artboard of manifest.children[0].children) {
      if (artboard.name === 'pasteboard') continue
      this.setFile(artboard)
    }
    ParseCommon.unifyFiles(this)
  },

  setFile (artboard) {
    this._debug.push(artboard)
    const name = ParseCommon.getName(artboard.name, this._html)
    this._html[name] = this.getFile(artboard, name)
  },

  getFile (element, name) {
    return {
      type: 'file',
      path: element.path,
      name,
      ref: HelperElement.generateElementRef(),
      x: element['uxdesign#bounds'].x,
      y: element['uxdesign#bounds'].y,
      width: element['uxdesign#bounds'].width,
      height: element['uxdesign#bounds'].height,
      nodes: []
    }
  },

  async parseNodes () {
    for (const file of Object.values(this._html)) {
      const filePath = `artwork/${file.path}/graphics/graphicContent.agc`
      const data = File.getFileData(filePath, this._importFolder)
      this._css.element[file.ref] = await this.getCssProperties({ ...file, type: 'block' }, {
        ...data.children[0],
        'uxdesign#bounds': {
          width: file.width,
          height: file.height
        }
      })
      const children = data.children[0].artboard.children
      this._svgData = await AdobexdIcon.prepareSvgData(children)
      await this.parseElements(children, this._html[file.name].nodes, this._html[file.name])
    }
  },

  async parseElements (elements, nodes, artboard, parent = null, pos = null) {
    pos = this.getElementPos(pos, artboard, parent)
    for (const element of elements) {
      const data = await this.parseElement(element, nodes, pos)
      if (!data || ParseCommon.isHidden(element.visible)) continue
      if (data.type !== 'icon' && element.group && element.group.children) {
        // skip children for icons; this also processes symbols
        await this.parseElements(element.group.children, nodes, artboard, element, pos)
      }
    }
  },

  getElementPos (pos, artboard, parent) {
    // parents are groups basically; we need to clone the `pos` object
    const data = {}
    if (!parent) {
      // when we have no parents we start adding the artboard position
      data.tx = Math.round(-artboard.x)
      data.ty = Math.round(-artboard.y)
    } else {
      // add the transform from the group parent
      data.tx = pos.tx + (Math.round(parent.transform?.tx) || 0)
      data.ty = pos.ty + (Math.round(parent.transform?.ty) || 0)
    }
    return data
  },

  async parseElement (element, nodes, pos) {
    if (ParseCommon.isHidden(element.visible)) return
    const type = this.getElementType(element)
    if (!type) return
    this.processSymbolInstance(element)
    const data = await this.getElementData(type, element, pos)
    this._css.element[data.ref] = await this.getCssProperties(data, element)
    nodes.push(data)
    return data
  },

  getElementType (element) {
    switch (element.type) {
      case 'shape':
        if (['rect', 'ellipse', 'line'].includes(element.shape.type)) {
          return 'block'
        } else if (['polygon', 'path', 'compound'].includes(element.shape.type) &&
          element.meta.ux.markedForExport) {
          // icons need to have export settings
          return 'icon'
        }
        break

      case 'group':
        // ignore clip masks
        if (element?.meta?.ux?.clipPathResources) return
        // symbols are also of this type
        return element.meta.ux.markedForExport ? 'icon' : 'block'

      case 'text':
        return 'text'
    }
  },

  processSymbolInstance (element) {
    const id = element.meta.ux.symbolId
    if (!id || !this._symbols[id] || element.group.children[0].type !== 'syncRef') {
      return
    }
    // we can use element.meta.ux.states depending on stateId,
    //  but we don't know the pseudo class selector
    // meta.ux.interactions[0].data.triggerEvent is always 'hover' and we can't set our own
    element.group.children = ExtendJS.cloneData(this._symbols[id].group.children)
  },

  async getElementData (type, element, pos) {
    this._debug.push(element) // for debugging
    const width = AdobexdCommon.getWidth(type, element, this._svgData)
    const height = AdobexdCommon.getHeight(type, element, this._svgData)
    let data = this.getData(type, element, pos, width, height)
    const extra = this.getExtraData(data, element)
    data = {
      ...data,
      ...await AdobexdIcon.getSvgContent(element, extra)
    }
    return data
  },

  getData (type, element, pos, width, height) {
    return {
      id: element.id, // for debugging
      name: element.name,
      x: AdobexdCommon.getX(pos.tx, type, element, this._svgData),
      y: AdobexdCommon.getY(pos.ty, type, element, this._svgData),
      width,
      height,
      type,
      ...this.getTag(element),
      ref: HelperElement.generateElementRef(),
      zIndex: ++this._zIndex,
      component: [],
      content: '',
      ...AdobexdInline.processTextContent(element, type, this._css),
      children: []
    }
  },

  getTag (element) {
    return (element.shape?.type === 'line') ? { tag: 'hr' } : null
  },

  async getCssProperties (data, element) {
    return {
      ...AdobexdCommon.getCssBasic(data.type, element, this._svgData),
      ...AdobexdCommon.getCssRoundedCorners(element.shape),
      ...AdobexdText.getCssText(data.type, this.prepareTextStyle(data.type, element), this._css),
      ...await this.getStyleProperties(data, element)
    }
  },

  async getStyleProperties (data, element) {
    if (!element.style) return
    const extra = this.getExtraData(data, element)
    return {
      ...await AdobexdFill.getCssFill(element, extra),
      ...AdobexdStroke.getCssStroke(data.type, element, this._svgPath),
      ...AdobexdIcon.getCssFillStroke(data.type, element),
      ...AdobexdEffect.getCssEffect(data.type, element)
    }
  },

  getExtraData (data, element) {
    return {
      data,
      element,
      projectFolder: this._projectFolder,
      importFolder: this._importFolder,
      processImages: this._processImages,
      svgData: this._svgData
    }
  },

  prepareTextStyle (type, element) {
    if (type !== 'text' && type !== 'inline') return
    return {
      ...element.style,
      sizeType: element.text ? element.text.frame.type : null
    }
  }
}
