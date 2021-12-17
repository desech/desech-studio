import HelperStyle from '../../helper/HelperStyle.js'
import HelperElement from '../../helper/HelperElement.js'
import HelperDOM from '../../helper/HelperDOM.js'
import StateSelectedElement from '../StateSelectedElement.js'
import StyleSheetSelector from '../stylesheet/StyleSheetSelector.js'
import StyleSheetCommon from '../stylesheet/StyleSheetCommon.js'
import StateStyleSheet from '../StateStyleSheet.js'
import HelperComponent from '../../helper/HelperComponent.js'

export default {
  async addSelectorLinkClass (selector) {
    if (!HelperStyle.isClassSelector(selector)) return
    const ref = StateSelectedElement.getRef()
    const cls = HelperStyle.extractClassSelector(selector)
    await StyleSheetSelector.linkClass(cls, ref)
  },

  setElementAttribute (element, name, value) {
    if (value === null) {
      element.removeAttributeNS(null, name)
    } else {
      element.setAttributeNS(null, name, value)
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

  pasteStyle (element, style) {
    if (!style) return
    this.pasteRemoveOldStyle(element)
    this.pasteAddNewStyle(element, style)
  },

  pasteRemoveOldStyle (element) {
    const selectors = StyleSheetSelector.getElementSelectors(element, 'ref')
    for (const selector of selectors) {
      StyleSheetSelector.deleteSelector(selector)
    }
  },

  pasteAddNewStyle (element, style) {
    const refSelector = StyleSheetSelector.getRefSelector(element)
    for (const [tmpSelector, rules] of Object.entries(style)) {
      const selector = tmpSelector.replace(/\.e0[a-z0-9]+/, refSelector)
      const sheet = StateStyleSheet.getCreateSelectorSheet(selector)
      StyleSheetCommon.addRemoveRules(sheet, selector, rules, true)
    }
  },

  async replaceComponent (element, data, subRef = null) {
    const ref = HelperElement.getRef(element)
    const children = HelperComponent.getInstanceChildren(element)
    const component = await HelperComponent.fetchComponent(data)
    element.replaceWith(component)
    HelperElement.replacePositionRef(component, ref)
    if (children) HelperComponent.setInstanceChildren(component, children)
    this.selectReplaceComponent(component, subRef)
  },

  selectReplaceComponent (component, subCmpRef) {
    // the positioning refs of the component elements get replaced, so undo will not work
    // anymore on the previous actions of the component elements
    if (subCmpRef) {
      // select this sub component instead
      const subComponent = HelperElement.getElement(subCmpRef)
      StateSelectedElement.selectElement(subComponent)
    } else {
      StateSelectedElement.selectElement(component)
    }
  }
}
