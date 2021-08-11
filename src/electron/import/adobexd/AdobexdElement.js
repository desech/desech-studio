import AdobexdCommon from './AdobexdCommon.js'
import ImportCommon from '../ImportCommon.js'
import AdobexdStyle from './AdobexdStyle.js'
import AdobexdInline from './AdobexdInline.js'
import AdobexdIcon from './AdobexdIcon.js'
import AdobexdText from './style/AdobexdText.js'
import AdobexdFillStroke from './style/AdobexdFillStroke.js'
import AdobexdEffect from './style/AdobexdEffect.js'
import HelperElement from '../../../js/helper/HelperElement.js'
import ExtendJS from '../../../js/helper/ExtendJS.js'

export default {
  getPos (artboard, parent, currentPos) {
    // parents are groups basically
    const data = {}
    if (!parent) {
      // when we have no parents we start adding the artboard position
      data.tx = Math.round(-artboard.x)
      data.ty = Math.round(-artboard.y)
    } else {
      // add the transform from the group parent
      data.tx = currentPos.tx + (Math.round(parent.transform?.tx) || 0)
      data.ty = currentPos.ty + (Math.round(parent.transform?.ty) || 0)
    }
    return data
  },

  async getData (node, pos, settings) {
    const desechType = this.getDesechType(node)
    // we don't allow hidden elements and masks
    if (!desechType || node.visible === false || node.meta?.ux?.clipPathResources) return
    const data = await this.getBasicData(desechType, node, pos)
    await this.addStyle(data, node, settings)
    await AdobexdInline.addInlineText(data, node)
    await AdobexdIcon.addSvgContent(data, node, settings)
    return data
  },

  getDesechType (node) {
    switch (node.type) {
      case 'shape':
        if (['rect', 'ellipse', 'line'].includes(node.shape.type)) {
          return 'block'
        } else if (['polygon', 'path', 'compound'].includes(node.shape.type)) {
          return 'icon'
        }
        break
      case 'group':
        // components are also of this type
        return 'block'
      case 'text':
        return 'text'
    }
  },

  async getBasicData (desechType, node, pos) {
    return {
      desechType,
      designType: ImportCommon.sanitizeName(node.shape?.type || node.type),
      id: node.id,
      ref: HelperElement.generateElementRef(),
      name: node.name.substring(0, 32),
      x: AdobexdCommon.getX(pos.tx, node),
      y: AdobexdCommon.getY(pos.ty, desechType, node),
      width: AdobexdCommon.getWidth(desechType, node),
      height: AdobexdCommon.getHeight(desechType, node),
      content: '',
      style: {},
      inlineChildren: [],
      debug: this.cloneNode(node)
    }
  },

  cloneNode (node) {
    const clone = ExtendJS.cloneData(node)
    delete clone.group
    return clone
  },

  async addStyle (data, node, settings) {
    data.style = ImportCommon.removeUndefined({
      layout: AdobexdStyle.getAutoLayout(node),
      text: AdobexdText.getText(node.style, data),
      fills: await AdobexdFillStroke.getFills(data, node, settings),
      stroke: await AdobexdFillStroke.getStroke(data, node, settings),
      corners: AdobexdStyle.getRoundedCorners(node.shape),
      effects: AdobexdEffect.getEffects(node),
      opacity: AdobexdStyle.getOpacity(node),
      blendMode: AdobexdStyle.getBlendMode(node),
      rotation: AdobexdStyle.getRotation(node)
    })
  }
}
