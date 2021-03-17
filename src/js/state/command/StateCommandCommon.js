import HelperStyle from '../../helper/HelperStyle.js'
import HelperElement from '../../helper/HelperElement.js'
import HelperDOM from '../../helper/HelperDOM.js'
import StateSelectedElement from '../StateSelectedElement.js'
import StyleSheetSelector from '../stylesheet/StyleSheetSelector.js'
import StyleSheetCommon from '../stylesheet/StyleSheetCommon.js'
import StateStyleSheet from '../StateStyleSheet.js'

export default {
  addSelectorLinkClass (selector) {
    if (!HelperStyle.isClassSelector(selector)) return
    const ref = StateSelectedElement.getRef()
    const cls = HelperStyle.extractClassSelector(selector)
    StyleSheetSelector.linkClass(cls, ref)
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

  // for some audio attributes, we set the node value too
  setAudioAttributes (element, name, value) {
    const attrs = ['src', 'autoplay', 'loop', 'muted', 'controls']
    if (!element.classList.contains('audio') || !attrs.includes(name)) return
    const node = HelperElement.getNode(element)
    this.setElementAttribute(node, name, value)
  },

  getOptionsNode (data) {
    if (data.type === 'datalist') {
      return document.getElementById(`datalist-${data.ref}`)
    } else {
      return HelperElement.getElement(data.ref)
    }
  },

  pasteAttributes (element, ref, data) {
    if (!data) return
    const type = HelperElement.getType(element)
    // needs to be the same element type
    if (!data.type || type !== data.type) return
    this.pasteAttributesList(element, ref, data.attributes)
    this.pasteContent(element, data.content)
  },

  pasteAttributesList (element, ref, attributes) {
    HelperDOM.removeAttributes(element)
    for (const [name, value] of Object.entries(attributes)) {
      const val = (name === 'class') ? ref + ' ' + value : value
      element.setAttributeNS(null, name, val)
    }
  },

  pasteContent (element, content) {
    // overwrites the whole audio chunk
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
  },

  getComponentAllProperties (element) {
    const allProperties = JSON.parse(element.dataset.allProperties)
    const properties = element.dataset.properties ? JSON.parse(element.dataset.properties) : {}
    allProperties[allProperties.length - 1] = properties
    return allProperties
  }
}
