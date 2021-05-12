import ParseCommon from './ParseCommon.js'
import HelperElement from '../../js/helper/HelperElement.js'
import AdobexdCommon from './adobexd/AdobexdCommon.js'
import AdobexdFill from './adobexd/AdobexdFill.js'
import AdobexdStroke from './adobexd/AdobexdStroke.js'
import AdobexdEffect from './adobexd/AdobexdEffect.js'
import AdobexdText from './adobexd/AdobexdText.js'
import AdobexdInline from './adobexd/AdobexdInline.js'
import Zip from '../file/Zip.js'
import File from '../file/File.js'
import ExtendJS from '../../js/helper/ExtendJS.js'

export default {
  _html: {},
  _css: {},
  _debug: [],
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
      const css = await this.getCssProperties({ ...file, type: 'block' }, {
        ...data.children[0],
        // pass along the width/height
        'uxdesign#bounds': {
          width: file.width,
          height: file.height
        }
      })
      this._css.element[file.ref] = css
      await this.parseElements(data.children[0].artboard.children, this._html[file.name].nodes,
        this._html[file.name])
    }
  },

  async parseElements (elements, nodes, artboard, parent = null, pos = null) {
    pos = this.getElementPos(artboard, parent, pos)
    for (const element of elements) {
      await this.parseElement(element, nodes, pos)
      if (ParseCommon.isHidden(element.visible)) continue
      if (element.group && element.group.children) {
        // this also processes symbols
        await this.parseElements(element.group.children, nodes, artboard, element, pos)
      }
      if (element.shape && element.shape.children) {
        await this.parseElements(element.shape.children, nodes, artboard, element, pos)
      }
    }
  },

  getElementPos (artboard, parent, pos) {
    const data = {}
    if (parent && parent.transform) {
      data.x = Math.round(parent.meta.ux.localTransform
        ? parent.transform.tx - artboard.x
        : parent.transform.tx + pos.x)
      data.y = Math.round(parent.meta.ux.localTransform
        ? parent.transform.ty - artboard.y
        : parent.transform.ty + pos.y)
    } else {
      data.x = Math.round(-artboard.x)
      data.y = Math.round(-artboard.y)
    }
    return data
  },

  async parseElement (element, nodes, pos) {
    if (!this.acceptElement(element) || ParseCommon.isHidden(element.visible)) {
      return
    }
    const type = this.getElementType(element)
    if (!type) return
    this.processSymbolInstance(element)
    const data = this.getElementData(type, element, pos)
    this._css.element[data.ref] = await this.getCssProperties(data, element)
    nodes.push(data)
  },

  acceptElement (element) {
    // ignore groups except the ones with symbols
    if (element.type === 'group' && !element.meta.ux.symbolId) {
      return false
    }
    return true
  },

  getElementType (element) {
    switch (element.type) {
      case 'shape':
        // rect, line, ellipse, polygon, path, compound
        if (['rect', 'line', 'ellipse'].includes(element.shape.type)) {
          return 'block'
        } else if (element.shape.type === 'polygon' && element.meta.ux.markedForExport) {
          // icons need to have export settings
          return 'icon'
        }
        return null
      case 'group':
        // symbols are also of this type
        return 'block'
      case 'text':
        return 'text'
      // ignore the rest
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

  getElementData (type, element, pos) {
    this._debug.push(element) // for debugging
    const width = AdobexdCommon.getWidth(type, element)
    const height = AdobexdCommon.getHeight(type, element)
    return {
      id: element.id, // for debugging
      name: element.name,
      x: AdobexdCommon.getX(type, element, pos.x),
      y: AdobexdCommon.getY(type, element, pos.y),
      width,
      height,
      type,
      ref: HelperElement.generateElementRef(),
      zIndex: ++this._zIndex,
      component: [],
      content: '',
      ...AdobexdInline.processTextContent(element, type, this._css),
      ...this.getSvgContent(element, type, width, height),
      children: []
    }
  },

  getSvgContent (element, type, width, height) {
    if (type !== 'icon') return
    let content
    // polygon has x/y/width/height, 3 points and style.stroke.width
    // path/compound has no x/y/width/height, but has the path value: <path d="..."/>
    if (element.shape.path) {
      content = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">` +
        `<path d="${element.shape.path}"/></svg>`
    } else {
      content = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>' +
      '</svg>'
    }
    return { content }
  },

  async getCssProperties (data, element) {
    // we ignore the meta.ux.repeatGrid, because ImportPosition will create grids
    return {
      ...AdobexdCommon.getCssBasic(data.type, element),
      ...AdobexdCommon.getCssRoundedCorners(element.shape),
      ...AdobexdText.getCssText(data.type, this.prepareTextStyle(data.type, element), this._css),
      ...await this.getStyleProperties(data, element)
    }
  },

  async getStyleProperties (data, element) {
    if (!element.style) return
    const extra = {
      data,
      element,
      projectFolder: this._projectFolder,
      importFolder: this._importFolder,
      processImages: this._processImages
    }
    return {
      ...AdobexdCommon.getCssMixBlendMode(element.style.blendMode),
      ...await AdobexdFill.getCssFill(extra),
      ...AdobexdStroke.getCssStroke(data.type, element),
      ...AdobexdEffect.getCssEffect(data.type, element.style.filters)
    }
  },

  prepareTextStyle (type, element) {
    if (type !== 'text' && type !== 'inline') return
    const attr = element.style.textAttributes
    return {
      ...element.meta.ux.rangedStyles[0],
      lineHeight: attr ? attr.lineHeight : null,
      paragraphAlign: attr ? attr.paragraphAlign : null,
      color: element.style.fill.color,
      sizeType: element.text ? element.text.frame.type : null
    }
  }
}
