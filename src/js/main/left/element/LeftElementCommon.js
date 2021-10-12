import HelperElement from '../../../helper/HelperElement.js'
import HelperComponent from '../../../helper/HelperComponent.js'

export default {
  getElements (container) {
    const results = []
    const componentData = HelperComponent.getCurrentComponentData()
    for (const element of container.children) {
      if (element.classList.contains('element') && HelperElement.isCanvasElement(element)) {
        results.push(this.getElementData(element, componentData))
      }
    }
    return results
  },

  getElementData (element, componentData) {
    const componentRef = HelperElement.getComponentRef(element)
    return {
      element,
      ref: HelperElement.getRef(element),
      classes: HelperElement.getClasses(element, true),
      type: HelperElement.getType(element),
      tag: HelperElement.getTag(element),
      isContainer: HelperElement.isContainer(element),
      hidden: HelperElement.isHidden(element),
      children: element.children.length ? this.getElements(element) : [],
      component: {
        ref: componentRef
      }
    }
  }
}
