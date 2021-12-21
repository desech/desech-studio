import HelperElement from '../../../../helper/HelperElement.js'
import StyleSheetSelector from '../../../../state/stylesheet/StyleSheetSelector.js'
import StyleSheetCommon from '../../../../state/stylesheet/StyleSheetCommon.js'
import ExtendJS from '../../../../helper/ExtendJS.js'

export default {
  getStyle (element, clean = true) {
    const style = {}
    const ref = HelperElement.getStyleRef(element)
    const selectors = StyleSheetSelector.getElementSelectors(element, 'ref')
    for (const selector of selectors) {
      const data = this.getSelectorStyle(selector, ref, clean)
      if (data) style[data.index] = data.style
    }
    return style
  },

  getSelectorStyle (selector, ref = null, clean = true) {
    const style = StyleSheetCommon.getSelectorStyle(selector, false)
    if (!style?.length) return
    const index = clean ? this.removeComponentFromSelector(selector, ref) : selector
    return { style, index }
  },

  removeComponentFromSelector (selector, ref) {
    return ExtendJS.removeExtraSpace(selector.replace(/\.e0[a-z0-9]+\[data-variant\]/g, ''))
  }
}
