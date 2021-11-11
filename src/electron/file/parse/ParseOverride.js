import HelperElement from '../../../js/helper/HelperElement.js'
import HelperDOM from '../../../js/helper/HelperDOM.js'
import HelperComponent from '../../../js/helper/HelperComponent.js'
import HelperOverride from '../../../js/helper/HelperOverride.js'

export default {
  getSubComponentData (child, parentOverrides) {
    const childOverrides = HelperOverride.getFullOverrides(child)
    if (parentOverrides && parentOverrides[child.ref]?.children) {
      HelperOverride.mergeObjects(childOverrides, parentOverrides[child.ref].children)
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
    const changed = this.overrideObjects(overrides, 'properties', ref, properties)
    if (changed) HelperElement.setProperties(node, properties)
  },

  setOverrideComponentProperties (node, overrides) {
    const data = HelperComponent.getComponentData(node)
    if (!data.properties) data.properties = {}
    const changed = this.overrideObjects(overrides, 'properties', data.ref, data.properties)
    if (changed) HelperComponent.setComponentData(node, data)
  },

  overrideObjects (overrides, type, ref, oldObj) {
    if (overrides && overrides[ref] && overrides[ref][type]) {
      for (const [name, obj] of Object.entries(overrides[ref][type])) {
        this.overrideObject(name, obj, oldObj)
      }
      return true
    } else {
      return false
    }
  },

  overrideObject (name, obj, oldObj) {
    if (obj.delete) {
      delete oldObj[name]
    } else {
      oldObj[name] = obj.value
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
  },

  setOverrideComponentVariants (node, overrides) {
    const data = HelperComponent.getComponentData(node)
    if (!data.variants) data.variants = {}
    const changed = this.overrideObjects(overrides, 'variants', data.ref, data.variants)
    if (changed) HelperComponent.setComponentData(node, data)
  }
}
