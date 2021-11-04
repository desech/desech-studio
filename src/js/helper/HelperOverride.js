import HelperComponent from './HelperComponent.js'
import HelperElement from './HelperElement.js'

export default {
  getElementParents (element, structure = []) {
    if (HelperComponent.isComponent(element)) {
      // the component root element
      this.addElementToStructure(element, structure)
      return this.getComponentParents(element.parentNode, structure)
    } else if (HelperComponent.isComponentHole(element)) {
      // the component hole element
      const component = element.closest('[data-ss-component]')
      if (!component) return structure
      this.addElementToStructure(component, structure)
      return this.getComponentParents(component.parentNode, structure)
    } else {
      // a regular component element
      return this.getComponentParents(element, structure)
    }
  },

  addElementToStructure (element, structure) {
    const data = HelperComponent.getComponentData(element)
    structure.unshift({ element, data })
  },

  getComponentParents (element, structure = []) {
    if (!element) return structure
    const node = element.closest('[data-ss-component], [data-ss-component-hole]')
    if (!node) return structure
    if (HelperComponent.isComponentHole(node)) {
      // when we find a hole, we need to skip its component
      const parent = node.closest('[data-ss-component]')?.parentNode
      this.getComponentParents(parent, structure)
    } else { // component
      this.addElementToStructure(node, structure)
      if (HelperComponent.isComponentElement(node)) {
        this.getComponentParents(node.parentNode, structure)
      }
    }
    return structure
  },

  getSectionOverrides (section, element) {
    const parents = this.getSectionParents(section, element)
    if (!parents?.length) return
    const ref = HelperElement.getStyleRef(element)
    return this.getOverrideData(parents, ref)
  },

  getSectionParents (section, element) {
    if (section !== 'component' && HelperComponent.belongsToAComponent(element)) {
      return this.getElementParents(element)
    } else if (section === 'component' && HelperComponent.isComponentElement(element)) {
      return this.getComponentParents(element)
    }
  },

  getOverrideData (parents, ref) {
    let data = this.getInitialData(parents[0].data)
    for (let i = 1; i < parents.length; i++) {
      data = this.getOverrideDataParent(data, parents[i].data.ref)
    }
    if (!data[ref]) data[ref] = {}
    return data[ref]
  },

  getInitialData (data) {
    if (!data.overrides) data.overrides = {}
    return data.overrides
  },

  getOverrideDataParent (data, ref) {
    if (!data[ref]) data[ref] = {}
    if (!data[ref].children) data[ref].children = {}
    return data[ref].children
  }
}
