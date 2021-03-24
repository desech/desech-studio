import HelperElement from '../../../helper/HelperElement.js'
import HelperDom from '../../../helper/HelperDOM.js'

export default {
  getElements (container) {
    const results = []
    for (const element of container.children) {
      if (!element.classList.contains('element') || !HelperElement.isCanvasElement(element)) {
        continue
      }
      results.push(this.getElementData(element))
    }
    return results
  },

  getElementData (element) {
    const isComponent = HelperElement.isComponent(element)
    const componentChildren = isComponent ? HelperElement.getComponentChildren(element) : null
    return {
      element,
      ref: HelperElement.getRef(element),
      classes: HelperElement.getClasses(element, true),
      type: HelperElement.getType(element),
      tag: HelperDom.getTag(element),
      isContainer: HelperElement.isContainer(element) || componentChildren,
      hidden: HelperElement.isHidden(element),
      children: this.getChildren(element, isComponent, componentChildren)
    }
  },

  getChildren (element, isComponent, componentChildren) {
    if (componentChildren) {
      return componentChildren.children.length ? this.getElements(componentChildren) : []
    } else if (isComponent) {
      return []
    } else {
      return element.children.length ? this.getElements(element) : []
    }
  }
}
