import ParseCommon from './ParseCommon.js'
import HelperElement from '../../js/helper/HelperElement.js'
import SketchCommon from './sketch/SketchCommon.js'
import SketchFill from './sketch/SketchFill.js'
import SketchStroke from './sketch/SketchStroke.js'
import SketchEffect from './sketch/SketchEffect.js'
import SketchText from './sketch/SketchText.js'
import SketchInline from './sketch/SketchInline.js'
import ExtendJS from '../../js/helper/ExtendJS.js'
import Zip from '../file/Zip.js'
import File from '../file/File.js'
import SketchIcon from './sketch/SketchIcon.js'

export default {
  _html: {},
  _css: {},
  _debug: [],
  _components: {},
  _symbols: {},
  _projectFolder: '',
  _importFolder: '',
  _zIndex: 0,
  _processImages: {},

  async getImportData (file, projectFolder) {
    this.reset(projectFolder)
    await ParseCommon.prepareProjectFolder(projectFolder)
    this._importFolder = Zip.unzipFileTmp(file)
    this.parseSymbols()
    await this.parseDocument()
    return {
      html: this._html,
      css: this._css,
      debug: this._debug
    }
  },

  reset (projectFolder) {
    this._html = {}
    this._debug = []
    this._components = {}
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

  parseSymbols () {
    const document = File.getFileData('document.json', this._importFolder)
    for (const page of document.pages) {
      const root = File.getFileData(page._ref + '.json', this._importFolder)
      for (const element of root.layers) {
        if (element._class === 'symbolMaster') this._symbols[element.symbolID] = element
      }
    }
  },

  async parseDocument () {
    const document = File.getFileData('document.json', this._importFolder)
    if (document.layerStyles) {
      await this.parseStyles(document.layerStyles.objects, 'block')
    }
    if (document.layerTextStyles) {
      await this.parseStyles(document.layerTextStyles.objects, 'text')
    }
    await this.parsePages(document)
  },

  async parseStyles (styles, type) {
    for (const style of styles) {
      await this.parseStyle(style, type)
    }
  },

  async parseStyle (style, type) {
    const tmp = ParseCommon.getName(style.name, this._css.component)
    const name = ParseCommon.sanitizeSelectorName(tmp)
    this._components[style.do_objectID] = name
    // background images will be ignored because there are no export settings
    // but they will be added on the element itself because it has all the proper data
    // sketch components are not really helpful, we rather create them by hand
    // this._css.component[name] = await this.getCssProperties({ type }, { style: style.value })
  },

  async parsePages (document) {
    for (const page of document.pages) {
      await this.parsePage(page._ref + '.json')
    }
    ParseCommon.unifyFiles(this)
  },

  async parsePage (file) {
    const page = File.getFileData(file, this._importFolder)
    // ignore empty pages
    // isVisible means that it's the default starting page, so we can't use it
    if (!page.layers.length) return
    const name = ParseCommon.getName(page.name, this._html)
    this._html[name] = { type: 'folder', name, files: {} }
    await this.parseRoot(page.layers, this._html[name].files)
    // ignore empty folders
    if (ExtendJS.isEmpty(this._html[name].files)) delete this._html[name]
  },

  async parseRoot (root, files) {
    for (const element of root) {
      if (!this.acceptFile(element)) continue
      const name = ParseCommon.getName(element.name, files)
      const file = this.getFileData(element, name)
      files[name] = file
      this._css.element[file.ref] = await this.getAllCssProperties({ ...file, type: 'block' },
        this.getFileStyle(element))
      await this.parseElements(element.layers, file.nodes)
    }
  },

  getFileData (element, name) {
    return {
      type: 'file',
      name,
      ref: HelperElement.generateElementRef(),
      width: SketchCommon.getWidth('block', element),
      height: SketchCommon.getHeight('block', element),
      nodes: []
    }
  },

  getFileStyle (element) {
    if (element.backgroundColor) {
      element.style = {
        fills: [
          {
            isEnabled: true,
            fillType: 0,
            color: element.backgroundColor
          }
        ]
      }
    }
    return element
  },

  acceptFile (element) {
    // ignore empty containers, non container elements, master symbols
    return (element.layers && element.layers.length && element._class !== 'symbolMaster')
  },

  async parseElements (elements, nodes, parent = null, pos = null) {
    if (parent) pos = this.getElementPosition(parent, pos)
    for (const element of elements) {
      await this.parseElement(element, nodes, parent, pos)
      if (ParseCommon.isHidden(element.isVisible)) continue
      if (element.layers && element._class !== 'shapeGroup') {
        // shapeGroup children are processed in the svg icon
        await this.parseElements(element.layers, nodes, element, pos)
      }
    }
  },

  getElementPosition (element, pos) {
    if (!pos) pos = {}
    return {
      x: Math.round((pos.x || 0) + element.frame.x),
      y: Math.round((pos.y || 0) + element.frame.y)
    }
  },

  async parseElement (element, nodes, parent, pos) {
    if (ParseCommon.isHidden(element.isVisible)) return
    const type = this.getElementType(element)
    this.processSymbolInstance(element)
    if (parent) this.passOverrideValue(element, parent)
    if (!type) return
    const data = this.getElementData(type, element, pos)
    await this.processElementCss(data, element)
    nodes.push(data)
  },

  getElementType (element) {
    // ignore group, symbolMaster, slice, MSImmutableHotspotLayer
    switch (element._class) {
      case 'rectangle': case 'bitmap': case 'symbolInstance': case 'oval':
        return 'block'
      case 'text':
        return 'text'
      case 'triangle': case 'shapePath': case 'star': case 'polygon': case 'shapeGroup':
        // icons need to have export settings
        if (!element.exportOptions || !element.exportOptions.exportFormats.length) return null
        return 'icon'
    }
  },

  processSymbolInstance (element) {
    if (element._class !== 'symbolInstance' || !this._symbols[element.symbolID]) return
    element.layers = ExtendJS.cloneData(this._symbols[element.symbolID].layers)
    // the export settings are taken from the symbol layer objects
  },

  passOverrideValue (element, parent) {
    // @todo if the width/height of the SymbolInstance has been changed, we don't know how to
    // override each child to fit inside
    element.parentSymbolID = (parent.symbolID || parent.parentSymbolID)
    if (!parent.overrideValues) return
    // pass along these values
    element.overrideValues = parent.overrideValues
    this.overwriteText(element, parent)
  },

  overwriteText (element, parent) {
    for (const value of parent.overrideValues) {
      if (!value.overrideName.includes(element.do_objectID + '_stringValue')) continue
      element.attributedString.string = value.value
      // reset the inline elements
      element.attributedString.attributes = []
    }
  },

  getElementData (type, element, pos) {
    this._debug.push(element) // for debugging
    const width = SketchCommon.getWidth(type, element)
    const height = SketchCommon.getHeight(type, element)
    return {
      id: element.do_objectID, // for debugging
      name: element.name,
      ...this.getElementPosition(element, pos),
      width,
      height,
      type,
      ref: HelperElement.generateElementRef(),
      zIndex: ++this._zIndex,
      component: [],
      content: '',
      ...SketchInline.processTextContent(element, type, this._css),
      ...SketchIcon.getSvgContent(element, width, height, type),
      children: []
    }
  },

  async processElementCss (data, element) {
    const properties = await this.getAllCssProperties(data, element)
    // sketch components are not really helpful, we rather create them by hand
    // this.processComponentProperties(data, properties, element)
    this._css.element[data.ref] = properties
  },

  async getAllCssProperties (data, element) {
    return {
      ...SketchCommon.getCssBasic(data.type, element),
      ...SketchCommon.getCssRoundedCorners(element),
      ...await this.getCssProperties(data, element)
    }
  },

  async getCssProperties (data, element) {
    if (!element.style) return
    const extra = {
      data,
      element,
      projectFolder: this._projectFolder,
      importFolder: this._importFolder,
      processImages: this._processImages
    }
    return {
      ...SketchCommon.getCssMixBlendMode(element),
      ...await SketchFill.getCssFill(extra),
      ...SketchStroke.getCssStroke(data.type, element),
      ...SketchEffect.getCssEffect(data.type, element),
      ...SketchText.getCssText(data.type, this.prepareTextStyle(element), this._css)
    }
  },

  prepareTextStyle (element) {
    return {
      ...(element.style.textStyle ? element.style.textStyle.encodedAttributes : null),
      fills: element.style.fills,
      sizeType: element.textBehaviour
    }
  }

  // processComponentProperties (data, properties, element) {
  //   if (element.sharedStyleID) this.processStyleComponent(data, properties, element)
  //   if (element.parentSymbolID) this.processSymbolComponent(data, properties, element)
  // },

  // processStyleComponent (data, properties, element) {
  //   const name = this._components[element.sharedStyleID]
  //   if (!name) return
  //   data.component.push(name)
  //   for (const [key, val] of Object.entries(properties)) {
  //     if (this._css.component[name][key] === val) {
  //       delete properties[key]
  //     }
  //   }
  // },

  // processSymbolComponent (data, properties, element) {
  //   const name = this.getComponentName(element)
  //   data.component.push(name)
  //   if (!this._css.component[name]) this._css.component[name] = { ...properties }
  //   for (const key in properties) {
  //     if (key !== 'width' && key !== 'height') delete properties[key]
  //   }
  // },

  // getComponentName (element) {
  //   const tmpName = this._symbols[element.parentSymbolID].name + ' ' + element.name
  //   const name = ParseCommon.getNameWithId(tmpName, this._css.component, element.do_objectID,
  //     this._components)
  //   return ParseCommon.sanitizeSelectorName(name)
  // }
}
