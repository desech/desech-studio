import HelperComponent from '../../helper/HelperComponent.js'
import HelperElement from '../../helper/HelperElement.js'
// import HelperCanvas from '../../helper/HelperCanvas.js'
import ExtendJS from '../../helper/ExtendJS.js'
import StateHtmlFile from '../html/StateHtmlFile.js'
import HelperDOM from '../../helper/HelperDOM.js'
import HelperFile from '../../helper/HelperFile.js'

export default {
  async overrideComponent (element, type, value) {
    if (HelperComponent.isComponent(element) || HelperComponent.isComponentElement(element)) {
      const component = element.closest('[data-ss-component]')
      const data = await this.processData(component, element, type, value)
      // await this.saveData(component, data)
      HelperComponent.setComponentData(component, data)
    }
  },

  async processData (component, element, type, value) {
    const data = HelperComponent.getComponentData(component)
    const ref = HelperElement.getStyleRef(element)
    const originalNode = await this.getOriginalNode(data.file, ref)
    this.processInstanceData(type, value, data, ref, originalNode)
    return data
  },

  async getOriginalNode (file, ref) {
    const div = document.createElement('div')
    const html = await window.electron.invoke('rendererParseComponentFile', file)
    div.innerHTML = html.canvas
    return div.getElementsByClassName(ref)[0]
  },

  processInstanceData (type, value, data, ref, originalNode) {
    this.initOverrideData(data, ref)
    switch (type) {
      case 'tag':
        this.processTag(value, data, ref, originalNode)
        break
      case 'inner':
        this.processInner(value, data, ref, originalNode)
        break
      case 'attributes':
        this.processAttributes(value, data, ref, originalNode)
        break
    }
    this.cleanOverrideData(data, ref)
  },

  initOverrideData (data, ref) {
    if (!data.overrides) data.overrides = {}
    if (!data.overrides[ref]) data.overrides[ref] = {}
  },

  cleanOverrideData (data, ref) {
    if (ExtendJS.isEmpty(data.overrides[ref])) {
      delete data.overrides[ref]
    }
    if (ExtendJS.isEmpty(data.overrides)) {
      delete data.overrides
    }
  },

  processTag (value, data, ref, originalNode) {
    const originalValue = HelperDOM.getTag(originalNode)
    if (value === originalValue) {
      delete data.overrides[ref].tag
    } else {
      data.overrides[ref].tag = value
    }
  },

  processInner (value, data, ref, originalNode) {
    value = this.cleanInner(value, originalNode)
    const originalValue = this.cleanInner(originalNode.innerHTML, originalNode)
    if (value === originalValue) {
      delete data.overrides[ref].inner
    } else {
      data.overrides[ref].inner = value
    }
  },

  cleanInner (value, originalNode) {
    const container = this.getNodeFromString(value, originalNode)
    this.cleanInnerNode(container)
    return container.innerHTML.trim()
  },

  getNodeFromString (value, node) {
    const tag = HelperDOM.getTag(node)
    const container = HelperDOM.createElement(tag, document)
    container.innerHTML = value
    return container
  },

  cleanInnerNode (node) {
    StateHtmlFile.setRelativeSourceAttr(node, 'src')
    StateHtmlFile.cleanAttributes(node)
    StateHtmlFile.cleanClasses(node, false)
    node.classList.remove('component-element')
    HelperElement.removeComponentRef(node)
    for (const child of node.children) {
      this.cleanInnerNode(child)
    }
  },

  processAttributes (attributes, data, ref, originalNode) {
    if (!data.overrides[ref].attributes) {
      data.overrides[ref].attributes = {}
    }
    for (const [name, value] of Object.entries(attributes)) {
      this.processAttribute(data, ref, originalNode, name, value)
    }
  },

  processAttribute (data, ref, originalNode, name, value) {
    if (name === 'data-ss-hidden') return
    const attrValue = this.getAttributeValue(value)
    const originalValue = this.getAttributeValue(originalNode.getAttributeNS(null, name))
    if (!ExtendJS.objectsEqual(attrValue, originalValue)) {
      data.overrides[ref].attributes[name] = attrValue
    } else {
      delete data.overrides[ref].attributes[name]
    }
  },

  getAttributeValue (value) {
    if (typeof value === 'boolean' && value) {
      return { value: '' }
    } else if (value) {
      return { value: HelperFile.getRelPath(value) }
    } else {
      return { delete: true }
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
  //   const components = HelperCanvas.getCanvas().querySelectorAll(`[data-ss-component*="${file}"]`)
  //   for (const component of components) {
  //     const data = HelperComponent.getComponentData(component)
  //     data.main = mainData
  //     HelperComponent.setComponentData(component, data)
  //   }
  // }
}
