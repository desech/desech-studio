import HelperElement from '../../../js/helper/HelperElement.js'
import FigmaCommon from './FigmaCommon.js'
import ParseCommon from '../ParseCommon.js'
import FigmaFill from './FigmaFill.js'
import FigmaStroke from './FigmaStroke.js'
import FigmaEffect from './FigmaEffect.js'
import FigmaText from './FigmaText.js'
import FigmaInline from './FigmaInline.js'
import ExtendJS from '../../../js/helper/ExtendJS.js'
import EventMain from '../../event/EventMain.js'
import Language from '../../lib/Language.js'
import FigmaIcon from './FigmaIcon.js'

export default {
  _html: {},
  _css: {},
  _file: '',
  _folder: '',
  _token: '',
  _figma: {},
  _figmaImages: {},
  _existingImages: {},
  _components: {},
  _zIndex: 0,

  async parseFigma (params) {
    EventMain.ipcMainInvoke('mainImportProgress', Language.localize('Parsing started'))
    this.reset(params)
    await this.parsePages(params.data.document.children)
    return {
      html: this._html,
      css: this._css,
      // for debug
      debug: this._figma
    }
  },

  reset (data) {
    this._figma = data.data
    this._existingImages = data.existingImages
    this._figmaImages = {}
    this._file = data.file
    this._folder = data.folder
    this._token = data.token
    this._components = {}
    this._html = {}
    this._zIndex = 0
    this._css = {
      font: [],
      component: {},
      element: {}
    }
  },

  async parsePages (pages) {
    for (const page of pages) {
      // ignore empty pages
      if (!page.children.length) continue
      await this.parsePage(page)
    }
    ParseCommon.unifyFiles(this)
  },

  async parsePage (page) {
    const name = ParseCommon.getName(page.name, this._html)
    this._html[name] = { type: 'folder', name, files: {} }
    await this.parseRoot(page.children, this._html[name].files)
    // ignore empty folders
    if (ExtendJS.isEmpty(this._html[name].files)) delete this._html[name]
  },

  async parseRoot (root, files) {
    for (const element of root) {
      // ignore empty containers or non container elements or invisible ones
      if (!element.children || !element.children.length || element.visible === false) {
        continue
      }
      const name = ParseCommon.getName(element.name, files)
      const file = this.getFile(element, name)
      files[name] = file
      const css = await this.getCssProperties({ ...file, type: 'block' }, element)
      this._css.element[file.ref] = css
      await this.parseElements(element.children, file.nodes, file)
    }
  },

  getFile (element, name) {
    return {
      type: 'file',
      name,
      x: Math.round(element.absoluteBoundingBox.x),
      y: Math.round(element.absoluteBoundingBox.y),
      width: FigmaCommon.getWidth('block', element),
      height: FigmaCommon.getHeight('block', element),
      ref: HelperElement.generateElementRef(),
      nodes: []
    }
  },

  async parseElements (elements, nodes, file) {
    for (const element of elements) {
      await this.parseElement(element, nodes, file)
      if (element.visible === false) continue
      if (element.children) await this.parseElements(element.children, nodes, file)
    }
  },

  async parseElement (element, nodes, file) {
    if (element.isMask || element.visible === false) return
    const type = this.getElementType(element)
    if (!type) return
    const data = await this.getElementData(type, element, file)
    await this.processElementCss(data, element)
    nodes.push(data)
  },

  getElementType (element) {
    // ignore SLICE
    switch (element.type) {
      case 'RECTANGLE': case 'LINE': case 'FRAME': case 'GROUP': case 'COMPONENT':
      case 'INSTANCE': case 'ELLIPSE':
        return this.convertElementType(element, 'block')
      case 'TEXT':
        return 'text'
      case 'VECTOR': case 'REGULAR_POLYGON': case 'STAR': case 'BOOLEAN_OPERATION':
        // icons need to have export settings
        if (!element.exportSettings || !element.exportSettings.length) return null
        return this.convertElementType(element, 'icon')
    }
  },

  convertElementType (element, type) {
    // convert blocks with svg exports to icons, and vectors with png exports to blocks
    if (!element.exportSettings || !element.exportSettings.length) return type
    return (element.exportSettings[0].format === 'SVG') ? 'icon' : 'block'
  },

  async getElementData (type, element, file) {
    return {
      id: element.id, // for debugging
      name: element.name.substring(0, 32),
      x: Math.round(element.absoluteBoundingBox.x - file.x),
      y: Math.round(element.absoluteBoundingBox.y - file.y),
      width: FigmaCommon.getWidth(type, element),
      height: FigmaCommon.getHeight(type, element),
      type,
      tag: null,
      ref: HelperElement.generateElementRef(),
      zIndex: ++this._zIndex,
      component: [],
      content: '',
      href: null,
      ...FigmaInline.processTextContent(element, type, this._css),
      ...await FigmaIcon.getSvgContent(element, type, this.getExtraData()),
      children: []
    }
  },

  getExtraData (params = {}) {
    return {
      existingImages: this._existingImages,
      figmaImages: this._figmaImages,
      folder: this._folder,
      projectFile: this._file,
      token: this._token,
      ...params
    }
  },

  async processElementCss (data, element) {
    const properties = await this.getCssProperties(data, element)
    // figma components are not really helpful, we rather create them by hand
    // if (element.styles) this.moveAllProperties(data, element, properties)
    this._css.element[data.ref] = properties
  },

  async getCssProperties (data, element) {
    // we ignore the figma layout grid, because ImportPosition will create grids
    const extra = this.getExtraData({ data })
    return {
      ...FigmaCommon.getCssBasic(data.type, element),
      ...FigmaCommon.getCssMixBlendMode(element.blendMode),
      ...FigmaCommon.getCssRoundedCorners(element),
      ...await FigmaFill.getCssFill(element, extra),
      ...await FigmaStroke.getCssStroke(element, extra),
      ...FigmaIcon.getCssFillStroke(data.type, element),
      ...FigmaEffect.getCssEffect(data.type, element),
      ...FigmaText.getCssText(data.type, element, this._css)
    }
  }

  // moveAllProperties (data, element, properties) {
  //   const componentProps = this.getAllComponentProperties()
  //   for (const type of ['fill', 'stroke', 'effect', 'text']) {
  //     // icons with both fill and stroke will use the fill component, while the strike component
  //     // will still have the border color, but it's harmless
  //     this.moveProperties(data, element.styles[type], type, properties, componentProps[type])
  //   }
  // },

  // getAllComponentProperties () {
  //   return {
  //     fill: FigmaFill.getProperties(),
  //     stroke: FigmaStroke.getProperties(),
  //     effect: FigmaEffect.getProperties(),
  //     text: FigmaText.getProperties()
  //   }
  // },

  // moveProperties (data, id, type, allProps, moveProps) {
  //   if (!id) return
  //   const name = this.getComponentName(id, type, allProps)
  //   data.component.push(name)
  //   if (!this._css.component[name]) this._css.component[name] = {}
  //   for (const [key, val] of Object.entries(allProps)) {
  //     if (!moveProps.includes(key)) continue
  //     this._css.component[name][key] = val
  //     delete allProps[key]
  //   }
  // },

  // getComponentName (id, type, allProps) {
  //   // we add the type because figma doesn't differentiate between fills
  //   const typeFixed = this.getComponentType(type, allProps)
  //   const idFixed = id + '-' + typeFixed
  //   const nameFixed = this._figma.styles[id].name + '-' + typeFixed
  //   const name = ParseCommon.getNameWithId(nameFixed, this._css.component, idFixed,
  //     this._components)
  //   return ParseCommon.sanitizeSelectorName(name)
  // },

  // getComponentType (type, allProps) {
  //   if (type === 'fill' && allProps.color) {
  //     // text fills should be of type 'text' not 'fill'
  //     return 'text'
  //   } else if ((type === 'fill' || type === 'stroke') && allProps.stroke) {
  //     // the icon fills/strokes should be of type svg
  //     return 'svg'
  //   } else {
  //     return type
  //   }
  // }
}
