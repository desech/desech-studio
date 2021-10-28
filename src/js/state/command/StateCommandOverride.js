import HelperComponent from '../../helper/HelperComponent.js'
import HelperElement from '../../helper/HelperElement.js'
import ExtendJS from '../../helper/ExtendJS.js'
import StateHtmlFile from '../html/StateHtmlFile.js'
import HelperDOM from '../../helper/HelperDOM.js'
import HelperFile from '../../helper/HelperFile.js'
import HelperStyle from '../../helper/HelperStyle.js'

export default {
  async overrideElement (element, type, value) {
    if (HelperComponent.isComponent(element) || HelperComponent.isComponentElement(element)) {
      const component = element.closest('[data-ss-component]')
      const data = await this.processElementData(component, element, type, value)
      // await this.saveData(component, data)
      HelperComponent.setComponentData(component, data)
    }
  },

  async processElementData (component, element, type, value) {
    const data = HelperComponent.getComponentData(component)
    if (this.isElementInlineOverride(element, data)) {
      element = element.closest('.text')
      type = 'inner'
      value = element.innerHTML
    }
    const ref = HelperElement.getStyleRef(element)
    const componentNode = await this.getComponentNode(data.file)
    const originalNode = componentNode.getElementsByClassName(ref)[0]
    const originalProps = HelperElement.getProperties(originalNode)
    this.overrideData(type, value, data, ref, originalNode, originalProps)
    return data
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

  overrideData (type, value, data, ref, originalNode, originalProps) {
    this.initOverrideData(data, ref)
    switch (type) {
      case 'tag':
        this.processElementTag(value, data, ref, originalNode)
        break
      case 'inner':
        this.processElementInner(value, data, ref, originalNode)
        break
      case 'attributes':
        this.processElementAttributes(value, data, ref, originalNode)
        break
      case 'properties': // element + component
        this.processProperties(data, ref, originalProps, value)
        break
      case 'classes':
        this.processElementClasses(value, data, ref, originalNode)
        break
      case 'component': // component file
        this.processComponentFile(value, data, ref, originalNode)
        break
    }
    this.cleanOverrideData(data, ref)
  },

  initOverrideData (data, ref) {
    if (!data.overrides) data.overrides = {}
    if (!data.overrides[ref]) data.overrides[ref] = {}
  },

  cleanOverrideData (data, ref) {
    for (const type of ['attributes', 'properties', 'classes']) {
      if (ExtendJS.isEmpty(data.overrides[ref][type])) {
        delete data.overrides[ref][type]
      }
    }
    if (ExtendJS.isEmpty(data.overrides[ref])) {
      delete data.overrides[ref]
    }
    if (ExtendJS.isEmpty(data.overrides)) {
      delete data.overrides
    }
  },

  processElementTag (value, data, ref, originalNode) {
    const originalValue = HelperDOM.getTag(originalNode)
    if (value === originalValue) {
      delete data.overrides[ref].tag
    } else {
      data.overrides[ref].tag = value
    }
  },

  processElementInner (value, data, ref, originalNode) {
    value = this.cleanElementInner(value, originalNode)
    const originalValue = this.cleanElementInner(originalNode.innerHTML, originalNode)
    if (value === originalValue) {
      delete data.overrides[ref].inner
    } else {
      data.overrides[ref].inner = value
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

  processElementAttributes (attributes, data, ref, originalNode) {
    if (!data.overrides[ref].attributes) {
      data.overrides[ref].attributes = {}
    }
    for (const [name, value] of Object.entries(attributes)) {
      this.processElementAttribute(data, ref, originalNode, name, value)
    }
  },

  processElementAttribute (data, ref, originalNode, name, value) {
    if (name === 'data-ss-hidden') return
    const attrValue = this.getElementAttributeValue(value)
    const originalValue = this.getElementAttributeValue(originalNode.getAttributeNS(null, name))
    if (!ExtendJS.objectsEqual(attrValue, originalValue)) {
      data.overrides[ref].attributes[name] = attrValue
    } else {
      delete data.overrides[ref].attributes[name]
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

  processProperties (data, ref, originalProps, newProps) {
    if (!data.overrides[ref].properties) {
      data.overrides[ref].properties = {}
    }
    this.updateDeleteProperties(originalProps, newProps, data.overrides[ref].properties)
    this.addProperties(originalProps, newProps, data.overrides[ref].properties)
    this.clearProperties(originalProps, newProps, data.overrides[ref].properties)
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

  processElementClasses (value, data, ref, originalNode) {
    if (!data.overrides[ref].classes) {
      data.overrides[ref].classes = {}
    }
    const exists = originalNode.classList.contains(value.cls)
    const cls = HelperStyle.getViewableClass(value.cls)
    this.processElementClass(cls, value.action, data, ref, exists)
  },

  processElementClass (cls, action, data, ref, exists) {
    if (exists && action === 'delete') {
      data.overrides[ref].classes[cls] = { delete: true }
    } else if (!exists && action === 'add') {
      data.overrides[ref].classes[cls] = { add: true }
    } else {
      delete data.overrides[ref].classes[cls]
    }
  },

  async overrideComponent (element, type, value) {
    if (HelperComponent.isComponentElement(element)) {
      const component = element.parentNode.closest('[data-ss-component]')
      const data = await this.processComponentData(component, element, type, value)
      // await this.saveData(component, data)
      HelperComponent.setComponentData(component, data)
    }
  },

  async processComponentData (component, element, type, value) {
    const data = HelperComponent.getComponentData(component)
    const ref = HelperComponent.getInstanceRef(element)
    const originalNode = await this.getOriginalComponent(data.file, ref)
    const originalProps = HelperComponent.getComponentData(originalNode).properties
    this.overrideData(type, value, data, ref, originalNode, originalProps)
    return data
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

  processComponentFile (value, data, ref, originalNode) {
    if (value === HelperComponent.getInstanceFile(originalNode)) {
      delete data.overrides[ref].component
    } else {
      data.overrides[ref].component = HelperFile.getRelPath(value)
    }
  }

  // async saveData (component, data) {
  //   // save the instance data to our component
  //   HelperComponent.setComponentData(component, data)
  //   // save the main data to the file
  //   await window.electron.invoke('rendererSaveComponentData', data.file, data.main)
  //   // save the main data of all the component instances found in the current opened file
  //   this.saveMainDataAllComponents(data.file, data.main)
  // },

  // saveMainDataAllComponents (file, mainData) {
  //   const components = HelperCanvas.getCanvas()
  //      .querySelectorAll(`[data-ss-component*="${file}"]`)
  //   for (const component of components) {
  //     const data = HelperComponent.getComponentData(component)
  //     data.main = mainData
  //     HelperComponent.setComponentData(component, data)
  //   }
  // }
}
