import HelperComponent from '../../helper/HelperComponent.js'
import HelperElement from '../../helper/HelperElement.js'
import ExtendJS from '../../helper/ExtendJS.js'
import StateHtmlFile from '../html/StateHtmlFile.js'
import HelperDOM from '../../helper/HelperDOM.js'
import HelperFile from '../../helper/HelperFile.js'
import HelperStyle from '../../helper/HelperStyle.js'
import HelperCanvas from '../../helper/HelperCanvas.js'

export default {
  async overrideElement (element, type, value) {
    // although we check if it's a component, we are actually interested in the root element
    if (HelperComponent.isComponent(element) || HelperComponent.isComponentElement(element)) {
      const parents = this.getElementParents(element)
      await this.processElementData(parents, element, type, value)
      await this.saveData(parents)
    }
  },

  getElementParents (element, structure = []) {
    if (HelperComponent.isComponent(element)) {
      // if this is a root element, then the component is the element itself
      const data = HelperComponent.getComponentData(element)
      structure.unshift({ element, data })
      this.getComponentParents(element.parentNode, structure)
    } else {
      this.getComponentParents(element, structure)
    }
    console.log('getElementParents', structure)
    return structure
  },

  // this is also called by overrideComponent()
  getComponentParents (element, structure = []) {
    const node = element.closest('[data-ss-component], [data-ss-component-hole]')
    if (!node) return structure
    if (HelperComponent.isComponentHole(node)) {
      // when we find a hole, we need to skip its component
      this.getComponentParents(node.closest('[data-ss-component]').parentNode, structure)
    } else { // component
      structure.unshift({
        element: node,
        data: HelperComponent.getComponentData(node)
      })
      if (HelperComponent.isComponentElement(node)) {
        this.getComponentParents(node.parentNode, structure)
      }
    }
    return structure
  },

  async processElementData (parents, element, type, value) {
    // if (this.isElementInlineOverride(element, parents[0].data)) {
    //   element = element.closest('.text')
    //   type = 'inner'
    //   value = element.innerHTML
    // }
    const ref = HelperElement.getStyleRef(element)
    const componentNode = await this.getComponentNode(parents[0].data.file)
    const originalNode = componentNode.getElementsByClassName(ref)[0]
    const originalProps = HelperElement.getProperties(originalNode)
    this.overrideData(type, value, parents, ref, originalNode, originalProps)
  },

  // @todo when you undo this inner override, it will use existing inline overrides
  // this means that the compared values are different so it will be seen as an inner override
  // fix this by building the inner compare value, without the other inline overrides
  isElementInlineOverride (element, data) {
    if (HelperElement.getType(element) !== 'inline') return
    const parent = element.closest('.text')
    const parentRef = HelperElement.getStyleRef(parent)
    return !!(data?.overrides && data.overrides[parentRef]?.inner)
  },

  async getComponentNode (file, ref) {
    const div = document.createElement('div')
    const html = await window.electron.invoke('rendererParseComponentFile', file)
    div.innerHTML = html.canvas
    return div
  },

  overrideData (type, value, parents, ref, originalNode, originalProps) {
    const data = this.initOverrideData(parents, ref)
    switch (type) {
      case 'tag':
        this.processElementTag(value, data, originalNode)
        break
      case 'inner':
        this.processElementInner(value, data, originalNode)
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

  initOverrideData (parents, ref) {
    let data = this.getInitialData(parents[0].data)
    for (let i = 1; i < parents.length; i++) {
      data = this.initOverrideDataParent(data, parents[i].data.ref)
    }
    if (!data[ref]) data[ref] = {}
    return data[ref]
  },

  getInitialData (data) {
    if (!data.overrides) data.overrides = {}
    return data.overrides
  },

  initOverrideDataParent (data, ref) {
    if (!data[ref]) data[ref] = {}
    if (!data[ref].children) data[ref].children = {}
    return data[ref].children
  },

  processElementTag (value, data, originalNode) {
    const originalValue = HelperDOM.getTag(originalNode)
    if (value === originalValue) {
      delete data.tag
    } else {
      data.tag = value
    }
  },

  processElementInner (value, data, originalNode) {
    value = this.cleanElementInner(value, originalNode)
    const originalValue = this.cleanElementInner(originalNode.innerHTML, originalNode)
    if (value === originalValue) {
      delete data.inner
    } else {
      data.inner = value
    }
  },

  cleanElementInner (value, originalNode) {
    const container = this.getNodeFromString(value, originalNode)
    this.cleanElementInnerNode(container)
    return container.innerHTML.trim()
  },

  getNodeFromString (value, node) {
    const tag = HelperDOM.getTag(node)
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
    this.clearRemovedAttributes(originalNode.attributes, attributes, data.attributes)
  },

  processElementAttribute (data, originalNode, name, value) {
    if (name === 'data-ss-hidden') return
    const attrValue = this.getElementAttributeValue(value)
    const originalValue = this.getElementAttributeValue(originalNode.getAttributeNS(null, name))
    if (!ExtendJS.objectsEqual(attrValue, originalValue)) {
      data.attributes[name] = attrValue
    } else {
      delete data.attributes[name]
    }
  },

  getElementAttributeValue (value) {
    if (typeof value === 'boolean' && value) {
      return { value: '' }
    } else if (value) {
      return { value: HelperFile.getRelPath(value) }
    } else {
      return { delete: true }
    }
  },

  clearRemovedAttributes (originalAttributes, changedAttributes, dataAttributes) {
    for (const attr of Object.keys(dataAttributes)) {
      if (!(attr in originalAttributes) && !(attr in changedAttributes)) {
        delete dataAttributes[attr]
      }
    }
  },

  processProperties (data, originalProps, newProps) {
    if (!data.properties) data.properties = {}
    this.updateDeleteProperties(originalProps, newProps, data.properties)
    this.addProperties(originalProps, newProps, data.properties)
    this.clearProperties(originalProps, newProps, data.properties)
  },

  updateDeleteProperties (originalProps, newProps, properties) {
    for (const [name, value] of Object.entries(originalProps)) {
      if (!newProps[name]) {
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
      if (!originalProps[name]) {
        properties[name] = { value }
      }
    }
  },

  clearProperties (originalProps, newProps, properties) {
    for (const name of Object.keys(properties)) {
      if (!originalProps[name] && !newProps[name]) {
        delete properties[name]
      }
    }
  },

  processElementClasses (value, data, originalNode) {
    if (!data.classes) data.classes = {}
    const exists = originalNode.classList.contains(value.cls)
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
      const parents = this.getComponentParents(element.parentNode)
      await this.processComponentData(parents, element, type, value)
      await this.saveData(parents)
    }
  },

  async processComponentData (parents, element, type, value) {
    const ref = HelperComponent.getInstanceRef(element)
    const originalNode = await this.getOriginalComponent(parents[0].data.file, ref)
    const originalProps = HelperComponent.getComponentData(originalNode).properties
    this.overrideData(type, value, parents, ref, originalNode, originalProps)
  },

  async getOriginalComponent (file, ref) {
    const component = await this.getComponentNode(file)
    const nodes = component.querySelectorAll('.component-element[data-ss-component]')
    for (const node of nodes) {
      const data = HelperComponent.getComponentData(node)
      if (data.ref === ref) return node
    }
    throw new Error("Can't find the original component")
  },

  processComponentFile (value, data, originalNode) {
    if (value === HelperComponent.getInstanceFile(originalNode)) {
      delete data.component
    } else {
      data.component = HelperFile.getRelPath(value)
    }
  },

  async saveData (parents) {
    // save the instance data to our component
    HelperComponent.setComponentData(parents[0].element, parents[0].data)
    // save the main data to the file
    // await window.electron.invoke('rendererSaveComponentData', data.file, data.main)
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
  }
}
