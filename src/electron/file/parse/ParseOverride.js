import HelperElement from '../../../js/helper/HelperElement.js'
import File from '../File.js'
import ParseCommon from './ParseCommon.js'
import HelperDOM from '../../../js/helper/HelperDOM.js'
import HelperComponent from '../../../js/helper/HelperComponent.js'

export default {
  setOverrideTag (component, data, document) {
    if (component?.data?.overrides && component.data.overrides[data.ref]?.tag) {
      data.tag = component.data.overrides[data.ref].tag
      if (HelperElement.isNormalTag(data.tag)) {
        data.node = HelperDOM.changeTag(data.node, data.tag, document)
      }
    }
  },

  setOverrideInner (node, component, ref) {
    if (component?.data?.overrides && component.data.overrides[ref]?.inner) {
      node.innerHTML = component.data.overrides[ref].inner
    }
  },

  setOverrideAttributes (node, component, folder) {
    const ref = HelperElement.getRef(node)
    if (component?.data?.overrides && component.data.overrides[ref]?.attributes) {
      for (const [name, obj] of Object.entries(component.data.overrides[ref].attributes)) {
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

  setOverrideElementProperties (node, component) {
    const properties = HelperElement.getProperties(node)
    const ref = HelperElement.getRef(node)
    this.overrideProperties(component, ref, properties)
    HelperElement.setProperties(node, properties)
  },

  setOverrideComponentProperties (node, component) {
    const data = HelperComponent.getComponentData(node)
    this.overrideProperties(component, data.ref, data.properties)
    HelperComponent.setComponentData(node, data)
  },

  overrideProperties (component, ref, originalProps) {
    if (component?.data?.overrides && component.data.overrides[ref]?.properties) {
      for (const [name, obj] of Object.entries(component.data.overrides[ref].properties)) {
        this.overrideProperty(name, obj, originalProps)
      }
    }
  },

  overrideProperty (name, obj, originalProps) {
    if (obj.delete) {
      delete originalProps[name]
    } else {
      originalProps[name] = obj.value
    }
  },

  setOverrideClasses (node, component) {
    const ref = HelperElement.getRef(node)
    if (component?.data?.overrides && component.data.overrides[ref]?.classes) {
      for (const [cls, obj] of Object.entries(component.data.overrides[ref].classes)) {
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
  }
}
