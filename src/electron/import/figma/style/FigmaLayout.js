export default {
  getAutoLayout (node) {
    // we don't need the gap and padding because this will be calculated later by us
    if (!node.layoutMode) return
    const direction = (node.layoutMode === 'HORIZONTAL') ? 'column' : 'row'
    const justifyContent = this.getJustifyContent(node, direction)
    const alignContent = this.getAlignContent(node, direction)
    if (justifyContent || alignContent) return { justifyContent, alignContent }
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
