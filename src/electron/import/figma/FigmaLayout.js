import ExtendJS from '../../../js/helper/ExtendJS.js'

export default {
  getAutoLayout (element) {
    if (!element.layoutMode) return
    const css = {}
    const mode = (element.layoutMode === 'HORIZONTAL') ? 'column' : 'row'
    this.setGridGap(css, mode, element.itemSpacing)
    this.setPadding(css, element)
    this.setJustifyContent(css, mode, element)
    this.setAlignContent(css, mode, element)
    return css
  },

  setGridGap (css, mode, spacing) {
    if (spacing && parseInt(spacing) !== 10) {
      css[mode + '-gap'] = parseInt(spacing) + 'px'
    }
  },

  setPadding (css, element) {
    for (const dir of ['top', 'bottom', 'left', 'right']) {
      const value = element['padding' + ExtendJS.capitalize(dir)]
      if (value) css['padding-' + dir] = value + 'px'
    }
  },

  setJustifyContent (css, mode, element) {
    if ((mode === 'column' && !element.primaryAxisAlignItems) ||
      (mode === 'row' && !element.counterAxisAlignItems)) {
      // this is redundant
      // css['justify-content'] = 'start'
    }
    if ((mode === 'column' && element.primaryAxisAlignItems === 'CENTER') ||
      (mode === 'row' && element.counterAxisAlignItems === 'CENTER')) {
      css['justify-content'] = 'center'
    }
    if ((mode === 'column' && element.primaryAxisAlignItems === 'MAX') ||
      (mode === 'row' && element.counterAxisAlignItems === 'MAX')) {
      css['justify-content'] = 'end'
    }
    if ((mode === 'column' && element.primaryAxisAlignItems === 'SPACE_BETWEEN') ||
      (mode === 'row' && element.counterAxisAlignItems === 'SPACE_BETWEEN')) {
      css['justify-content'] = 'space-between'
    }
  },

  setAlignContent (css, mode, element) {
    if ((mode === 'column' && !element.counterAxisAlignItems) ||
      (mode === 'row' && !element.primaryAxisAlignItems)) {
      // this is redundant
      // css['align-content'] = 'start'
    }
    if ((mode === 'column' && element.counterAxisAlignItems === 'CENTER') ||
      (mode === 'row' && element.primaryAxisAlignItems === 'CENTER')) {
      css['align-content'] = 'center'
    }
    if ((mode === 'column' && element.counterAxisAlignItems === 'MAX') ||
      (mode === 'row' && element.primaryAxisAlignItems === 'MAX')) {
      css['align-content'] = 'end'
    }
    if ((mode === 'column' && element.counterAxisAlignItems === 'SPACE_BETWEEN') ||
      (mode === 'row' && element.primaryAxisAlignItems === 'SPACE_BETWEEN')) {
      css['align-content'] = 'space-between'
    }
  }
}
