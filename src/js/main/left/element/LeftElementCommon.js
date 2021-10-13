import HelperElement from '../../../helper/HelperElement.js'
import HelperComponent from '../../../helper/HelperComponent.js'
import ExtendJS from '../../../helper/ExtendJS.js'

export default {
  getElements (container) {
    const results = []
    const componentData = HelperComponent.getComponentMainData()
    for (const element of container.children) {
      if (element.classList.contains('element') && HelperElement.isCanvasElement(element)) {
        results.push(this.getElementData(element, componentData))
      }
    }
    return results
  },

  getElementData (element, componentData) {
    return {
      element,
      ref: HelperElement.getRef(element),
      styleRef: HelperElement.getStyleRef(element),
      classes: HelperElement.getClasses(element, true),
      type: HelperElement.getType(element),
      tag: HelperElement.getTag(element),
      isContainer: HelperElement.isContainer(element),
      hidden: HelperElement.isHidden(element),
      children: element.children.length ? this.getElements(element) : [],
      isComponentHole: HelperComponent.isComponentHole(element),
      component: this.getComponentData(element)
    }
  },

  getComponentData (element) {
    const data = HelperComponent.getComponentInstanceData(element)
    if (!data) return null
    data.name = HelperComponent.getComponentInstanceName(null, data.file)
    return data
  }
}
