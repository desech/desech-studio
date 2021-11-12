import HelperComponent from '../../helper/HelperComponent.js'
import HelperElement from '../../helper/HelperElement.js'
import ExtendJS from '../../helper/ExtendJS.js'
import StateHtmlFile from '../html/StateHtmlFile.js'
import HelperDOM from '../../helper/HelperDOM.js'
import HelperFile from '../../helper/HelperFile.js'
import HelperStyle from '../../helper/HelperStyle.js'
import HelperOverride from '../../helper/HelperOverride.js'
import HelperTrigger from '../../helper/HelperTrigger.js'

export default {
  async overrideElement (element, type, value) {
    if (!HelperComponent.belongsToAComponent(element)) return
    const parents = HelperOverride.getElementParents(element)
    if (!parents.length) return
    await this.processElementData(parents, element, type, value)
    HelperComponent.setComponentData(parents[0].element, parents[0].data)
    HelperTrigger.triggerReload('right-panel-style')
    return parents
  },

  async processElementData (parents, element, type, value) {
    const ref = HelperElement.getStyleRef(element)
    const componentNode = await this.getComponentNode(parents[0].data.file)
    const originalNode = componentNode.getElementsByClassName(ref)[0]
    this.overrideData(type, value, parents, element, ref, originalNode)
  },

  async getComponentNode (file) {
    const div = document.createElement('div')
    const html = await window.electron.invoke('rendererParseComponentFile', { file })
    div.innerHTML = html.canvas
    return div
  },

  overrideData (type, value, parents, element, ref, originalNode) {
    const data = HelperOverride.getNodeSimpleOverrides(parents, ref)
    switch (type) {
      case 'tag':
        this.processElementTag(value, data, originalNode)
        break
      case 'inner':
        this.processElementInner(value, data, originalNode, element)
        break
      case 'attributes':
        this.processElementAttributes(value, data, originalNode)
        break
      case 'properties':
        this.processObject(data, 'properties', this.getElementProperties(originalNode), value)
        break
      case 'classes':
        this.processElementClasses(value, data, originalNode)
        break
      case 'component': // component file
        this.processComponentFile(value, data, originalNode)
        break
      case 'component-properties':
        this.processObject(data, 'properties', this.getComponentProperties(originalNode), value)
        break
      case 'variants':
        this.processComponentVariants(value, data, originalNode)
        break
    }
    ExtendJS.clearEmptyObjects(parents[0].data)
  },

  getElementProperties (originalNode) {
    // when we swap components, then we can't find children of that component in our original cmp
    return originalNode ? HelperElement.getProperties(originalNode) : null
  },

  getComponentProperties (originalNode) {
    // when we swap components, then we can't find children of that component in our original cmp
    return originalNode ? HelperComponent.getInstanceProperties(originalNode) : null
  },

  processElementTag (value, data, originalNode) {
    const originalValue = originalNode ? HelperDOM.getTag(originalNode) : null
    if (value === originalValue) {
      delete data.tag
    } else {
      data.tag = value
    }
  },

  processElementInner (value, data, originalNode, element) {
    value = this.cleanElementInner(value, originalNode, element)
    const originalValue = originalNode
      ? this.cleanElementInner(originalNode.innerHTML, originalNode)
      : null
    if (value === originalValue) {
      delete data.inner
    } else {
      data.inner = value
    }
  },

  cleanElementInner (value, originalNode, element = null) {
    const container = this.getNodeFromString(value, originalNode, element)
    this.cleanElementInnerNode(container)
    return container.innerHTML.trim()
  },

  getNodeFromString (value, node, element) {
    const tag = HelperDOM.getTag(node || element)
    const container = HelperDOM.createElement(tag, document)
    container.innerHTML = value
    return container
  },

  cleanElementInnerNode (node) {
    StateHtmlFile.setRelativeSourceAttr(node, 'src')
    StateHtmlFile.cleanAttributes(node)
    StateHtmlFile.cleanClasses(node, false)
    node.classList.remove('component-element')
    HelperElement.removePositionRef(node)
    for (const child of node.children) {
      this.cleanElementInnerNode(child)
    }
  },

  processElementAttributes (attributes, data, originalNode) {
    if (!data.attributes) data.attributes = {}
    for (const [name, value] of Object.entries(attributes)) {
      this.processElementAttribute(data, originalNode, name, value)
    }
  },

  processElementAttribute (data, originalNode, name, value) {
    if (name === 'data-ss-hidden') return
    const attrValue = this.getElementAttributeValue(value)
    const originalValue = originalNode ? this.getNodeAttributeValue(originalNode, name) : null
    if (!ExtendJS.objectsEqual(attrValue, originalValue)) {
      data.attributes[name] = attrValue
    } else {
      delete data.attributes[name]
    }
  },

  getElementAttributeValue (value) {
    if (value === null) {
      return { delete: true }
    } else {
      return { value: HelperFile.getRelPath(value) }
    }
  },

  getNodeAttributeValue (node, name) {
    if (!node.hasAttributeNS(null, name)) {
      return { delete: true }
    } else {
      const value = node.getAttributeNS(null, name)
      return { value: HelperFile.getRelPath(value) }
    }
  },

  processObject (data, type, oldObj, newObj) {
    if (!data[type]) data[type] = {}
    if (!oldObj) oldObj = {}
    if (!newObj) newObj = {}
    this.updateDeleteObject(oldObj, newObj, data[type])
    this.addObject(oldObj, newObj, data[type])
    this.clearObject(oldObj, newObj, data[type])
  },

  updateDeleteObject (oldObj, newObj, obj) {
    for (const [name, value] of Object.entries(oldObj)) {
      if (!(name in newObj)) {
        obj[name] = { delete: true }
      } else if (value !== newObj[name]) {
        obj[name] = { value: newObj[name] }
      } else {
        delete obj[name]
      }
    }
  },

  addObject (oldObj, newObj, obj) {
    for (const [name, value] of Object.entries(newObj)) {
      if (!(name in oldObj)) {
        obj[name] = { value }
      }
    }
  },

  clearObject (oldObj, newObj, obj) {
    for (const name of Object.keys(obj)) {
      if (!(name in oldObj) && !(name in newObj)) {
        delete obj[name]
      }
    }
  },

  processElementClasses (value, data, originalNode) {
    if (!data.classes) data.classes = {}
    const exists = originalNode ? originalNode.classList.contains(value.cls) : false
    const cls = HelperStyle.getViewableClass(value.cls)
    this.processElementClass(cls, value.action, data, exists)
  },

  processElementClass (cls, action, data, exists) {
    if (exists && action === 'delete') {
      data.classes[cls] = { delete: true }
    } else if (!exists && action === 'add') {
      data.classes[cls] = { add: true }
    } else {
      delete data.classes[cls]
    }
  },

  async overrideComponent (element, type, value) {
    if (!HelperComponent.isComponentElement(element)) return
    const parents = HelperOverride.getComponentParents(element.parentNode)
    if (!parents.length) return
    await this.processComponentData(parents, element, type, value)
    HelperComponent.setComponentData(parents[0].element, parents[0].data)
    HelperTrigger.triggerReload('component-section')
    return parents
  },

  async processComponentData (parents, element, type, value) {
    const ref = HelperElement.getComponentRef(element)
    const originalNode = await this.getOriginalComponent(parents[0].data.file, ref)
    this.overrideData(type, value, parents, element, ref, originalNode)
  },

  async getOriginalComponent (file, ref) {
    const component = await this.getComponentNode(file)
    const nodes = component.querySelectorAll('.component-element[data-ss-component]')
    for (const node of nodes) {
      if (HelperElement.getComponentRef(node) === ref) {
        return node
      }
    }
  },

  processComponentFile (file, data, originalNode) {
    const originalFile = originalNode ? HelperComponent.getInstanceFile(originalNode) : null
    if (file === originalFile) {
      delete data.component
    } else {
      data.component = HelperFile.getRelPath(file)
    }
  },

  processComponentVariants (variant, data, originalNode) {
    const originalVars = originalNode ? HelperComponent.getInstanceVariants(originalNode) : {}
    if (!data.variants) data.variants = {}
    if (!originalVars || !originalVars[variant.name] ||
      originalVars[variant.name] !== variant.value) {
      data.variants[variant.name] = variant.value
    } else {
      delete data.variants[variant.name]
    }
  }
}
