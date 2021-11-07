import HelperComponent from '../../helper/HelperComponent.js'
import HelperElement from '../../helper/HelperElement.js'
import ExtendJS from '../../helper/ExtendJS.js'
import StateHtmlFile from '../html/StateHtmlFile.js'
import HelperDOM from '../../helper/HelperDOM.js'
import HelperFile from '../../helper/HelperFile.js'
import HelperStyle from '../../helper/HelperStyle.js'
import HelperCanvas from '../../helper/HelperCanvas.js'
import HelperOverride from '../../helper/HelperOverride.js'

export default {
  async overrideElement (element, type, value) {
    if (HelperComponent.belongsToAComponent(element)) {
      const parents = HelperOverride.getElementParents(element)
      if (!parents.length) return
      await this.processElementData(parents, element, type, value)
      await this.saveData(parents)
    }
  },

  async processElementData (parents, element, type, value) {
    const ref = HelperElement.getStyleRef(element)
    const componentNode = await this.getComponentNode(parents[0].data.file)
    const originalNode = componentNode.getElementsByClassName(ref)[0]
    // when we swap components, then we can't find children of that component in our original cmp
    const originalProps = originalNode ? HelperElement.getProperties(originalNode) : null
    this.overrideData(type, value, parents, element, ref, originalNode, originalProps)
  },

  async getComponentNode (file) {
    const div = document.createElement('div')
    const html = await window.electron.invoke('rendererParseComponentFile', file)
    div.innerHTML = html.canvas
    return div
  },

  overrideData (type, value, parents, element, ref, originalNode, originalProps) {
    const data = HelperOverride.getOverrideData(parents, ref)
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
      case 'properties': // element + component
        this.processProperties(data, originalProps, value)
        break
      case 'classes':
        this.processElementClasses(value, data, originalNode)
        break
      case 'component': // component file
        this.processComponentFile(value, data, originalNode)
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
    HelperElement.removeComponentRef(node)
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

  processProperties (data, originalProps, newProps) {
    if (!data.properties) data.properties = {}
    if (!originalProps) originalProps = {}
    if (!newProps) newProps = {}
    this.updateDeleteProperties(originalProps, newProps, data.properties)
    this.addProperties(originalProps, newProps, data.properties)
    this.clearProperties(originalProps, newProps, data.properties)
  },

  updateDeleteProperties (originalProps, newProps, properties) {
    for (const [name, value] of Object.entries(originalProps)) {
      if (!(name in newProps)) {
        properties[name] = { delete: true }
      } else if (value !== newProps[name]) {
        properties[name] = { value: newProps[name] }
      } else {
        delete properties[name]
      }
    }
  },

  addProperties (originalProps, newProps, properties) {
    for (const [name, value] of Object.entries(newProps)) {
      if (!(name in originalProps)) {
        properties[name] = { value }
      }
    }
  },

  clearProperties (originalProps, newProps, properties) {
    for (const name of Object.keys(properties)) {
      if (!(name in originalProps) && !(name in newProps)) {
        delete properties[name]
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
    if (HelperComponent.isComponentElement(element)) {
      const parents = HelperOverride.getComponentParents(element.parentNode)
      if (!parents.length) return
      await this.processComponentData(parents, element, type, value)
      await this.saveData(parents)
    }
  },

  async processComponentData (parents, element, type, value) {
    const ref = HelperComponent.getInstanceRef(element)
    const originalNode = await this.getOriginalComponent(parents[0].data.file, ref)
    // when we swap components, then we can't find children of that component in our original cmp
    const originalProps = originalNode
      ? HelperComponent.getComponentData(originalNode).properties
      : null
    this.overrideData(type, value, parents, element, ref, originalNode, originalProps)
  },

  async getOriginalComponent (file, ref) {
    const component = await this.getComponentNode(file)
    const nodes = component.querySelectorAll('.component-element[data-ss-component]')
    for (const node of nodes) {
      const data = HelperComponent.getComponentData(node)
      if (data.ref === ref) return node
    }
  },

  processComponentFile (value, data, originalNode) {
    const originalValue = originalNode ? HelperComponent.getInstanceFile(originalNode) : null
    if (value === originalValue) {
      delete data.component
    } else {
      data.component = HelperFile.getRelPath(value)
    }
  },

  async saveData (parents) {
    // save the instance data to our component
    HelperComponent.setComponentData(parents[0].element, parents[0].data)
    // save the main data of all the component instances found in the current opened file
    // this.saveMainDataAllComponents(data.file, data.main)
  },

  saveMainDataAllComponents (file, mainData) {
    const components = HelperCanvas.getCanvas().querySelectorAll(`[data-ss-component*="${file}"]`)
    for (const component of components) {
      const data = HelperComponent.getComponentData(component)
      data.main = mainData
      HelperComponent.setComponentData(component, data)
    }
  },

  addVariantToMain (data, name, value) {
    if (!data.main) data.main = {}
    if (!data.main.variants) data.main.variants = {}
    if (!data.main.variants[name]) data.main.variants[name] = {}
    data.main.variants[name][value] = data.overrides
  },

  addVariantToInstance (element, data, name, value) {
    delete data.overrides
    if (!data.variants) data.variants = {}
    data.variants[name] = value
    HelperComponent.setComponentData(element, data)
  },

  deleteVariantFromMain (data, name, value) {
    const overrides = ExtendJS.cloneData(data.main.variants[name][value])
    delete data.main.variants[name][value]
    ExtendJS.clearEmptyObjects(data)
    return overrides
  },

  // this delete action is only used by undo delete when we only have one instance using the data
  undoVariantFromInstance (element, data, name, overrides) {
    data.overrides = overrides
    delete data.variants[name]
    ExtendJS.clearEmptyObjects(data)
    HelperComponent.setComponentData(element, data)
  }
}
