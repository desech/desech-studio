import HelperStyle from '../../helper/HelperStyle.js'
import HelperElement from '../../helper/HelperElement.js'
import HelperDOM from '../../helper/HelperDOM.js'
import StateSelectedElement from '../StateSelectedElement.js'
import StyleSheetSelector from '../stylesheet/StyleSheetSelector.js'
import StyleSheetCommon from '../stylesheet/StyleSheetCommon.js'
import StateStyleSheet from '../StateStyleSheet.js'
import StateCommandOverride from './StateCommandOverride.js'
import ExtendJS from '../../helper/ExtendJS.js'
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

  async pasteAttributes (element, data, resetOverrides) {
    if (!data) return
    const type = HelperElement.getType(element)
    // needs to be the same element type
    if (!data.type || type !== data.type) return
    await this.pasteAttributesList(element, data.attributes, data.filter, resetOverrides)
    await this.pasteContent(element, data.content, resetOverrides)
    element = await this.pasteTag(element, data.tag, resetOverrides)
    this.resetOverrides(element, resetOverrides)
  },

  async pasteAttributesList (element, attributes, filter, resetOverrides) {
    // we need the override before the changes
    // when we have the reset on undo, there's no need to set the overrides since we are already
    // resetting them
    if (!resetOverrides) {
      await this.overrideAttributes(element, ExtendJS.cloneData(attributes))
    }
    // when we have no filter, we remove all attributes
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

  async overrideAttributes (element, attributes) {
    await this.overrideClasses(element, attributes)
    await this.overrideElementProperties(element, attributes)
    // the classes and properties have been deleted from the attributes object
    await StateCommandOverride.overrideElement(element, 'attributes', attributes, false)
    // data-ss-component is not copied, which means we can't override the component data like
    // component properties and variants
    // @todo maybe in the future implement this too
  },

  async overrideClasses (element, attributes) {
    // we don't want to merge the previous classes because undo will no longer work
    const classes = HelperElement.getClasses(attributes.class.split(' '))
    const data = []
    for (const cls of classes) {
      data.push({ cls, action: 'add' })
    }
    await StateCommandOverride.overrideElement(element, 'classes', data, false)
    delete attributes.class
  },

  async overrideElementProperties (element, attributes) {
    // we don't want to merge the previous properties because undo will no longer work
    const properties = attributes['data-ss-properties']
      ? JSON.parse(attributes['data-ss-properties'])
      : null
    await StateCommandOverride.overrideElement(element, 'properties', properties, false)
    delete attributes['data-ss-properties']
  },

  async pasteContent (element, content, resetOverrides) {
    if (content === null || content === element.innerHTML) return
    element.innerHTML = content
    if (!resetOverrides) {
      await StateCommandOverride.overrideElement(element, 'inner', content, false)
    }
  },

  async pasteTag (element, tag, resetOverrides) {
    if (tag === HelperDOM.getTag(element)) return element
    element = HelperDOM.changeTag(element, tag, document)
    if (!resetOverrides) {
      await StateCommandOverride.overrideElement(element, 'tag', tag, false)
    }
    return element
  },

  resetOverrides (element, data) {
    if (!data || !data.componentRef) return
    const component = HelperElement.getElement(data.componentRef)
    if (!component) return
    const cmpData = HelperComponent.getComponentData(component)
    cmpData.overrides = data.overrides
    HelperComponent.setComponentData(component, cmpData)
    // also set the component-element class because we remove it when we cleanup classes
    element.classList.add('component-element')
  },

  pasteStyle (element, style) {
    // we check here if the style data needs to be processed, not if it exists
    // if this is an empty object, then it's fine because we do need to remove all styles
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
  }
}
