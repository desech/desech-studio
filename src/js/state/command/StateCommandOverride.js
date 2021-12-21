import HelperComponent from '../../helper/HelperComponent.js'
import HelperElement from '../../helper/HelperElement.js'
import ExtendJS from '../../helper/ExtendJS.js'
import StateHtmlFile from '../html/StateHtmlFile.js'
import HelperDOM from '../../helper/HelperDOM.js'
import HelperFile from '../../helper/HelperFile.js'
import HelperStyle from '../../helper/HelperStyle.js'
import HelperOverride from '../../helper/HelperOverride.js'
import HelperTrigger from '../../helper/HelperTrigger.js'
import StateCommandComponent from './StateCommandComponent.js'

export default {
  async overrideElement (element, type, value, reload = true) {
    if (!HelperComponent.belongsToAComponent(element)) return
    const parents = HelperOverride.getElementParents(element)
    if (!parents.length) return
    await this.processElementData(parents, element, type, value)
    HelperComponent.setComponentData(parents[0].element, parents[0].data)
    if (reload) HelperTrigger.triggerReload('right-panel')
    return parents
  },

  async processElementData (parents, element, type, value) {
    const ref = HelperElement.getStyleRef(element)
    const componentNode = await this.getComponentNode(parents[0].data, type)
    const originalNode = this.getOriginalElement(element, parents[0].element,
      componentNode.children[0])
    this.overrideData(type, value, parents, element, ref, originalNode)
  },

  // this returns a <div> that wraps the component inside, that's why we will use children[0] later
  async getComponentNode (data, type) {
    const div = document.createElement('div')
    const cmpData = this.getOriginalComponentData(data, type)
    const html = await window.electron.invoke('rendererParseComponentFile', cmpData)
    div.innerHTML = html.canvas
    return div
  },

  getOriginalComponentData (data, type) {
    const cmpData = { file: data.file }
    // we also want the variants because overrides sit on top of variants
    if (data?.variants) cmpData.variants = data.variants
    return cmpData
  },

  getOriginalElement (element, component, originalComponent) {
    if (element === component) return originalComponent
    const path = this.buildParentPath(element, component)
    return this.getNodeFromPath(originalComponent, path)
  },

  buildParentPath (node, topParent, path = []) {
    path.unshift(HelperDOM.getChildIndex(node))
    if (node.parentNode !== topParent) {
      this.buildParentPath(node.parentNode, topParent, path)
    }
    return path
  },

  getNodeFromPath (node, path, index = 0) {
    if (index <= path.length - 1) {
      return this.getNodeFromPath(node.children[path[index]], path, index + 1)
    } else {
      return node
    }
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
        this.processElementProperties(value, data, originalNode)
        break
      case 'classes':
        this.processElementClasses(value, data, originalNode)
        break
      case 'component': // component file
        this.processComponentFile(value, data, originalNode)
        break
      case 'component-properties':
        this.processComponentProperties(value, data, originalNode)
        break
      case 'variants':
        this.processComponentVariants(value, data, originalNode)
        break
    }
    ExtendJS.clearEmptyObjects(parents[0].data)
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

  processElementClasses (classes, data, originalNode) {
    if (!data.classes) data.classes = {}
    for (const value of classes) {
      const exists = originalNode ? originalNode.classList.contains(value.cls) : false
      const label = HelperStyle.getViewableClass(value.cls)
      this.processElementClass(label, value.action, data, exists)
    }
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

  processElementProperties (properties, data, originalNode) {
    const originalProps = this.getElementProperties(originalNode)
    data.properties = HelperOverride.processDiffObject(originalProps, properties,
      (value, action) => {
        return (action === 'add') ? { value } : { delete: true }
      })
  },

  getElementProperties (originalNode) {
    // when we swap components, we will not find children of that component in our original cmp
    return originalNode ? HelperElement.getProperties(originalNode) : null
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
    const originalNode = await this.getOriginalComponent(parents[0].data, ref, type)
    this.overrideData(type, value, parents, element, ref, originalNode)
  },

  async getOriginalComponent (data, childRef, type) {
    const component = await this.getComponentNode(data, type)
    const nodes = component.querySelectorAll('.component-element[data-ss-component]')
    for (const node of nodes) {
      if (HelperElement.getComponentRef(node) === childRef) {
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

  processComponentProperties (properties, data, originalNode) {
    const originalProps = this.getComponentProperties(originalNode)
    data.properties = HelperOverride.processDiffObject(originalProps, properties,
      (value, action) => {
        return (action === 'add') ? { value } : { delete: true }
      })
  },

  getComponentProperties (originalNode) {
    // when we swap components, we will not find children of that component in our original cmp
    return originalNode ? HelperComponent.getInstanceProperties(originalNode) : null
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
  },

  async swapOverrideComponent (element, data) {
    await this.overrideComponent(element, 'component', data.file)
    // replace the whole parent component because overrides are messy
    const parent = HelperOverride.getMainParent(element, 'component')
    await StateCommandComponent.replaceComponent(parent.element, parent.data, data.ref)
  }
}
