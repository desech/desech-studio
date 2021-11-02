import HelperElement from '../../../js/helper/HelperElement.js'
import File from '../File.js'
import ParseCommon from './ParseCommon.js'
import HelperDOM from '../../../js/helper/HelperDOM.js'
import HelperComponent from '../../../js/helper/HelperComponent.js'
import ExtendJS from '../../../js/helper/ExtendJS.js'

export default {
  getSubComponentData (parent, child) {
    // we clone the object because we don't want to change the original data
    const data = ExtendJS.cloneData(child)
    if (parent?.overrides && parent?.overrides[child.ref]?.children) {
      if (!data.overrides) data.overrides = {}
      this.mergeParentChildData(parent.overrides[child.ref].children, data.overrides)
    }
    return data
  },

  mergeParentChildData (parent, child) {
    Object.assign(child, parent)
    this.mergeParentChildFix(child)
  },

  mergeParentChildFix (obj) {
    // Object.assign will merge everything including the attribute/property/class values
    // if we have these pairs value/delete or add/delete, remove the first value
    if (obj.length === 2 && (('value' in obj && 'delete' in obj) ||
      ('add' in obj && 'delete' in obj))) {
      delete obj[Object.keys(obj)[0]]
    }
    for (const val of Object.values(obj)) {
      if (typeof val === 'object') this.mergeParentChildFix(val)
    }
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
      const val = this.setAbsoluteUrlAttribute(name, obj.value, folder)
      node.setAttributeNS(null, name, val)
    }
  },

  setAbsoluteUrlAttribute (name, value, folder) {
    if (['src', 'poster', 'data'].includes(name)) {
      return File.resolve(folder, value)
    } else if (name === 'srcset') {
      return ParseCommon.fixSrcSet(value, folder)
    } else {
      return value
    }
  },

  setOverrideElementProperties (node, overrides) {
    const properties = HelperElement.getProperties(node)
    const ref = HelperElement.getRef(node)
    const changed = this.overrideProperties(overrides, ref, properties)
    if (changed) HelperElement.setProperties(node, properties)
  },

  setOverrideComponentProperties (node, overrides) {
    const data = HelperComponent.getComponentData(node)
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
