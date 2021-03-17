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
    const componentWithChildren = isComponent && HelperElement.getComponentChildren(element)
    return {
      element,
      ref: HelperElement.getRef(element),
      classes: HelperElement.getClasses(element, true),
      type: HelperElement.getType(element),
      tag: HelperDom.getTag(element),
      isContainer: HelperElement.isContainer(element) || componentWithChildren,
      hidden: HelperElement.isHidden(element),
      children: this.getChildren(element, isComponent, componentWithChildren)
    }
  },

  getChildren (element, isComponent, componentWithChildren) {
    if (componentWithChildren) {
      const children = HelperElement.getComponentChildren(element)
      return children.children.length ? this.getElements(children) : []
    } else if (isComponent) {
      return []
    } else {
      return element.children.length ? this.getElements(element) : []
    }
  }
}
