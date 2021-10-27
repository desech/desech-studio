import HelperStyle from '../../helper/HelperStyle.js'
import HelperElement from '../../helper/HelperElement.js'
import HelperDOM from '../../helper/HelperDOM.js'
import StateSelectedElement from '../StateSelectedElement.js'
import StyleSheetSelector from '../stylesheet/StyleSheetSelector.js'
import StyleSheetCommon from '../stylesheet/StyleSheetCommon.js'
import StateStyleSheet from '../StateStyleSheet.js'

export default {
  async addSelectorLinkClass (selector) {
    if (!HelperStyle.isClassSelector(selector)) return
    const ref = StateSelectedElement.getRef()
    const cls = HelperStyle.extractClassSelector(selector)
    await StyleSheetSelector.linkClass(cls, ref)
  },

  setElementAttribute (element, name, value) {
    if (typeof value === 'boolean' && value) {
      element.setAttributeNS(null, name, '')
    } else if (value) {
      element.setAttributeNS(null, name, value)
    } else {
      element.removeAttributeNS(null, name)
    }
  },

  pasteAttributes (element, data) {
    if (!data) return
    const type = HelperElement.getType(element)
    // needs to be the same element type
    if (!data.type || type !== data.type) return
    this.pasteAttributesList(element, data.attributes, data.filter)
    this.pasteContent(element, data.content)
  },

  pasteAttributesList (element, attributes, filter) {
    if (!filter) HelperDOM.removeAttributes(element)
    for (const [name, value] of Object.entries(attributes)) {
      if (filter && name === 'class') {
        if (value) this.appendAttributeClass(element.classList, value.split(' '))
      } else {
        element.setAttributeNS(null, name, value)
      }
    }
  },

  appendAttributeClass (list, newClasses) {
    for (const cls of newClasses) {
      list.add(cls)
    }
  },

  pasteContent (element, content) {
    if (content) element.innerHTML = content
  },

  pasteStyle (element, ref, style) {
    if (!style) return
    this.pasteRemoveOldStyle(element)
    this.pasteAddNewStyle(ref, style)
  },

  pasteRemoveOldStyle (element) {
    const selectors = StyleSheetSelector.getElementSelectors(element, 'ref')
    for (const selector of selectors) {
      StyleSheetSelector.deleteSelector(selector)
    }
  },

  pasteAddNewStyle (ref, style) {
    for (const [tmpSelector, rules] of Object.entries(style)) {
      const selector = tmpSelector.replace(/\.e0[a-z0-9]+/, '.' + ref)
      const sheet = StateStyleSheet.getCreateSelectorSheet(selector)
      StyleSheetCommon.addRemoveRules(sheet, selector, rules)
    }
  }
}
