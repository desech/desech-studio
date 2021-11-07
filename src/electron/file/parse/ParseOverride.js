import HelperElement from '../../../js/helper/HelperElement.js'
import HelperDOM from '../../../js/helper/HelperDOM.js'
import HelperComponent from '../../../js/helper/HelperComponent.js'
import HelperOverride from '../../../js/helper/HelperOverride.js'

export default {
  getSubComponentData (parent, child) {
    const parentOverrides = HelperOverride.getFullOverrides(parent)
    const childOverrides = HelperOverride.getFullOverrides(child)
    if (parentOverrides[child.ref]?.children) {
      HelperOverride.merge2Objects(childOverrides, parentOverrides[child.ref].children)
    }
    return { ...child, fullOverrides: childOverrides }
  },

  setOverrideTag (nodeData, overrides, document) {
    if (overrides && overrides[nodeData.ref]?.tag) {
      nodeData.tag = overrides[nodeData.ref].tag
      if (HelperElement.isNormalTag(nodeData.tag)) {
        nodeData.node = HelperDOM.changeTag(nodeData.node, nodeData.tag, document)
      }
    }
  },

  setOverrideInner (node, overrides, ref) {
    if (overrides && overrides[ref]?.inner) {
      node.innerHTML = overrides[ref].inner
    }
  },

  setOverrideAttributes (node, overrides, folder) {
    const ref = HelperElement.getRef(node)
    if (overrides && overrides[ref]?.attributes) {
      for (const [name, obj] of Object.entries(overrides[ref].attributes)) {
        this.setOverrideAttribute(name, obj, node, folder)
      }
    }
  },

  setOverrideAttribute (name, obj, node, folder) {
    if (obj.delete) {
      node.removeAttributeNS(null, name)
    } else {
      node.setAttributeNS(null, name, obj.value)
    }
  },

  setOverrideElementProperties (node, overrides) {
    const properties = HelperElement.getProperties(node) || {}
    const ref = HelperElement.getRef(node)
    const changed = this.overrideProperties(overrides, ref, properties)
    if (changed) HelperElement.setProperties(node, properties)
  },

  setOverrideComponentProperties (node, overrides) {
    const data = HelperComponent.getComponentData(node)
    if (!data.properties) data.properties = {}
    const changed = this.overrideProperties(overrides, data.ref, data.properties)
    if (changed) HelperComponent.setComponentData(node, data)
  },

  overrideProperties (overrides, ref, originalProps) {
    if (overrides && overrides[ref]?.properties) {
      for (const [name, obj] of Object.entries(overrides[ref].properties)) {
        this.overrideProperty(name, obj, originalProps)
      }
      return true
    } else {
      return false
    }
  },

  overrideProperty (name, obj, originalProps) {
    if (obj.delete) {
      delete originalProps[name]
    } else {
      originalProps[name] = obj.value
    }
  },

  setOverrideClasses (node, overrides) {
    const ref = HelperElement.getRef(node)
    if (overrides && overrides[ref]?.classes) {
      for (const [cls, obj] of Object.entries(overrides[ref].classes)) {
        this.setOverrideClass(cls, obj, node)
      }
    }
  },

  setOverrideClass (cls, obj, node) {
    if (obj.add) {
      node.classList.add(cls)
    } else if (obj.delete) {
      node.classList.remove(cls)
    }
  },

  setOverrideComponentFile (data, overrides) {
    if (overrides && overrides[data.ref]?.component) {
      data.file = overrides[data.ref].component
    }
  }
}
