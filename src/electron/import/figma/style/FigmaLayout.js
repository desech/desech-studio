import ExtendJS from '../../../../js/helper/ExtendJS.js'

export default {
  getAutoLayout (node) {
    if (!node.layoutMode) return
    const record = {}
    record.direction = (node.layoutMode === 'HORIZONTAL') ? 'column' : 'row'
    if (node.itemSpacing) record.gap = parseInt(node.itemSpacing)
    record.padding = this.getPadding(node)
    record.justifyContent = this.getJustifyContent(node, record.direction)
    record.alignContent = this.getAlignContent(node, record.direction)
    return !ExtendJS.isEmpty(record) ? record : undefined
  },

  getPadding (node) {
    const padding = {}
    for (const dir of ['top', 'bottom', 'left', 'right']) {
      const value = node['padding' + ExtendJS.capitalize(dir)]
      if (value) padding[dir] = Math.round(value)
    }
    return padding
  },

  getJustifyContent (node, direction) {
    if ((direction === 'column' && !node.primaryAxisAlignItems) ||
      (direction === 'row' && !node.counterAxisAlignItems)) {
      // this is redundant
      // return 'start'
    }
    if ((direction === 'column' && node.primaryAxisAlignItems === 'CENTER') ||
      (direction === 'row' && node.counterAxisAlignItems === 'CENTER')) {
      return 'center'
    }
    if ((direction === 'column' && node.primaryAxisAlignItems === 'MAX') ||
      (direction === 'row' && node.counterAxisAlignItems === 'MAX')) {
      return 'end'
    }
    if ((direction === 'column' && node.primaryAxisAlignItems === 'SPACE_BETWEEN') ||
      (direction === 'row' && node.counterAxisAlignItems === 'SPACE_BETWEEN')) {
      return 'space-between'
    }
  },

  getAlignContent (node, direction) {
    if ((direction === 'column' && !node.counterAxisAlignItems) ||
      (direction === 'row' && !node.primaryAxisAlignItems)) {
      // this is redundant
      // return 'start'
    }
    if ((direction === 'column' && node.counterAxisAlignItems === 'CENTER') ||
      (direction === 'row' && node.primaryAxisAlignItems === 'CENTER')) {
      return 'center'
    }
    if ((direction === 'column' && node.counterAxisAlignItems === 'MAX') ||
      (direction === 'row' && node.primaryAxisAlignItems === 'MAX')) {
      return 'end'
    }
    if ((direction === 'column' && node.counterAxisAlignItems === 'SPACE_BETWEEN') ||
      (direction === 'row' && node.primaryAxisAlignItems === 'SPACE_BETWEEN')) {
      return 'space-between'
    }
  }
}
