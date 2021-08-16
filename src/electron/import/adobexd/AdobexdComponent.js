import ExtendJS from '../../../js/helper/ExtendJS.js'

export default {
  getChildren (node, components) {
    const component = components[node.meta.ux.symbolId]
    if (!node.meta.ux.symbolId || !component) return
    const nodeChildren = ExtendJS.cloneData(node.group.children)
    const componentChildren = this.getComponentChildren(node, component)
    return this.overrideComponents(nodeChildren, componentChildren)
  },

  getComponentChildren (node, component) {
    const children = (!node.meta.ux.stateId || (node.meta.ux.symbolId === node.meta.ux.stateId))
      ? component.group.children
      : this.getDifferentStateChildren(node, component)
    return ExtendJS.cloneData(children)
  },

  getDifferentStateChildren (node, component) {
    for (const state of component.meta.ux.states) {
      if (state.id === node.meta.ux.stateId) {
        return state.group.children
      }
    }
  },

  overrideComponents (nodeChildren, componentChildren) {
    for (let i = 0; i < nodeChildren.length; i++) {
      if (!nodeChildren[i] || !componentChildren[i]) continue
      if (nodeChildren[i].type === 'syncRef') {
        nodeChildren[i] = componentChildren[i]
      } else if (nodeChildren[i].group?.children?.length &&
        componentChildren[i].group?.children?.length) {
        this.overrideComponents(nodeChildren[i].group.children,
          componentChildren[i].group.children)
      }
    }
    // this will only be relevant when called the first time, not when in recursion calls
    return nodeChildren
  }
}
