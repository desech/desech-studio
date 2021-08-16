import ExtendJS from '../../../js/helper/ExtendJS.js'

export default {
  getChildren (node, components) {
    const component = components[node.symbolID]
    if (!node.symbolID || !component) return
    const componentChildren = ExtendJS.cloneData(component.layers)
    this.overrideText(componentChildren, node.overrideValues)
    return componentChildren
  },

  overrideText (componentChildren, override) {
    // @todo implement width/height for overrides
    // this will override the text, but not the width/height
    // we do have the containers with the exact width/height, but if they have no style they are
    // ignored and the background colors are in the master symbol, not on the instance
    for (const node of componentChildren) {
      const value = this.getOverrideValue(node.do_objectID, override)
      if (value) node.attributedString.string = value
      // if we have a symbol inside a symbol, then pass the override values from the parent
      if (node.symbolID && override?.length) node.overrideValues = override
      if (node.layers?.length) this.overrideText(node.layers, override)
    }
  },

  getOverrideValue (id, override) {
    for (const value of override) {
      // with complex components, we have the component id in front with a backslash
      // 5D6B6C0F-07C1-4E69-96EB-E36FF695F5EB/6CEC8615-AAF1-404C-B071-C7CBE70B8B03_stringValue
      if (value.overrideName.endsWith(id + '_stringValue')) {
        return value.value
      }
    }
  }
}
