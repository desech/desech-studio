import HelperElement from '../../../js/helper/HelperElement.js'
import HelperDOM from '../../../js/helper/HelperDOM.js'
import HelperComponent from '../../../js/helper/HelperComponent.js'
import HelperOverride from '../../../js/helper/HelperOverride.js'
import ParseCommon from './ParseCommon.js'

export default {
  getSubComponentData (child, parentOverrides) {
    // this will fetch the latest overwritten data
    const data = HelperComponent.getComponentData(child)
    data.fullOverrides = HelperOverride.getTopComponentFullOverrides(data)
    if (parentOverrides && parentOverrides[data.ref]?.children) {
      HelperOverride.mergeObjects(data.fullOverrides, parentOverrides[data.ref].children)
    }
    return data
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
    if (overrides && overrides[ref] && 'inner' in overrides[ref]) {
      node.innerHTML = overrides[ref].inner
    }
  },

  setOverrideAttributes (node, overrides, folder) {
    const ref = HelperElement.getStyleRef(node)
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
      const value = (name === 'srcset') ? ParseCommon.fixSrcSet(obj.value, folder) : obj.value
      node.setAttributeNS(null, name, value)
    }
  },

  setOverrideElementProperties (node, overrides) {
    const properties = HelperElement.getProperties(node) || {}
    const ref = HelperElement.getStyleRef(node)
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
    const ref = HelperElement.getStyleRef(node)
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
    if (!overrides || !overrides[data.ref]?.variants) return
    this.overrideVariants(data, overrides[data.ref].variants)
    HelperComponent.setComponentData(node, data)
  },

  overrideVariants (data, overrideVariants) {
    if (!data.variants) data.variants = {}
    for (const [name, value] of Object.entries(overrideVariants)) {
      if (value) {
        data.variants[name] = value
      } else {
        delete data.variants[name]
      }
    }
  }
}
