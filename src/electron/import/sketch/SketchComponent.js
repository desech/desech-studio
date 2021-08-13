import ExtendJS from '../../../js/helper/ExtendJS.js'

export default {
  getChildren (node, components) {
    const component = components[node.symbolID]
    if (!node.symbolID || !component) return
    // const nodeChildren = ExtendJS.cloneData(node.layers)
    const componentChildren = this.getComponentChildren(node, component)
    return componentChildren
  },

  getComponentChildren (node, component) {
    return ExtendJS.cloneData(component.layers)
  }
}
