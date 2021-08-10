import ExtendJS from '../../../js/helper/ExtendJS.js'
import FigmaCommon from './FigmaCommon.js'
import ImportCommon from '../ImportCommon.js'
import FigmaLayout from './style/FigmaLayout.js'
import FigmaStyle from './FigmaStyle.js'
import FigmaFill from './style/FigmaFill.js'
import FigmaStroke from './style/FigmaStroke.js'
import FigmaEffect from './style/FigmaEffect.js'
import FigmaText from './style/FigmaText.js'
import FigmaInline from './FigmaInline.js'
import FigmaIcon from './FigmaIcon.js'
import HelperElement from '../../../js/helper/HelperElement.js'

export default {
  async getData (node, file, settings) {
    const desechType = this.getDesechType(node)
    // we don't allow hidden elements and masks
    if (!desechType || node.visible === false || node.isMask) return
    const data = this.getBasicData(desechType, node, file)
    await this.addStyle(data, node, settings)
    await FigmaInline.addInlineText(data, node, settings)
    await FigmaIcon.addSvgContent(data, node, settings)
    return data
  },

  getDesechType (node) {
    // https://www.figma.com/developers/api#node-types
    switch (node.type) {
      case 'FRAME': case 'RECTANGLE': case 'LINE': case 'ELLIPSE': case 'GROUP':
      case 'COMPONENT': case 'INSTANCE':
        return (node.exportSettings && node.exportSettings[0]?.format === 'SVG')
          ? 'icon'
          : 'block'
      case 'TEXT':
        return 'text'
      case 'VECTOR': case 'REGULAR_POLYGON': case 'STAR': case 'BOOLEAN_OPERATION':
        return 'icon'
      case 'SLICE': case 'COMPONENT_SET':
        // ignored
    }
  },

  getBasicData (desechType, node, file) {
    return {
      desechType,
      designType: ImportCommon.sanitizeName(node.type),
      id: node.id,
      ref: HelperElement.generateElementRef(),
      name: node.name.substring(0, 32),
      x: Math.round(node.absoluteBoundingBox.x - file.x),
      y: Math.round(node.absoluteBoundingBox.y - file.y),
      width: FigmaCommon.getWidth(desechType, node),
      height: FigmaCommon.getHeight(desechType, node),
      content: '',
      style: {},
      inlineChildren: [],
      debug: this.cloneNode(node)
    }
  },

  cloneNode (node) {
    const clone = ExtendJS.cloneData(node)
    delete clone.children
    return clone
  },

  async addStyle (data, node, settings) {
    const fills = await FigmaFill.getFills(data, node, settings)
    const stroke = await FigmaStroke.getStroke(data, node, settings)
    const isRender = this.isRender(data.desechType, fills, stroke)
    data.style = ImportCommon.removeUndefined({
      rotation: FigmaStyle.getRotation(node),
      corners: isRender ? undefined : FigmaStyle.getRoundedCorners(node),
      layout: FigmaLayout.getAutoLayout(node),
      text: FigmaText.getText(node.style, data),
      fills: (isRender && isRender !== 'fill') ? undefined : fills,
      stroke: (isRender && isRender !== 'stroke') ? undefined : stroke,
      blendMode: isRender ? undefined : FigmaStyle.getBlendMode(node.blendMode),
      opacity: isRender ? undefined : FigmaStyle.getOpacity(node.opacity),
      effects: isRender ? undefined : FigmaEffect.getEffects(node)
    })
  },

  // we render the images, so the fills, strokes and effects are already in the image
  isRender (desechType, fills, stroke) {
    if (desechType === 'icon') return 'all'
    if (fills && fills[0].type === 'image') return 'fill'
    if (stroke && stroke.type === 'image') return 'stroke'
  }
}
