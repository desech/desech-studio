import HelperElement from '../../../helper/HelperElement.js'
import HelperComponent from '../../../helper/HelperComponent.js'

export default {
  getElements (container) {
    const results = []
    const componentData = HelperComponent.getMainData()
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
      classes: HelperElement.getClasses(element.classList, true),
      type: HelperElement.getType(element),
      tag: HelperElement.getTag(element),
      isContainer: HelperElement.isContainer(element),
      hidden: HelperElement.isHidden(element),
      children: element.children.length ? this.getElements(element) : [],
      component: this.getComponentData(element)
    }
  },

  getComponentData (element) {
    if (!HelperComponent.belongsToAComponent(element)) return null
    const obj = {
      draggable: (element === HelperComponent.getMovableElement(element))
    }
    if (HelperComponent.isComponent(element)) {
      this.addComponentNode(element, obj)
    } else if (HelperComponent.isComponentHole(element)) {
      this.addComponentHole(element, obj)
    } else {
      obj.isElement = true
    }
    return obj
  },

  addComponentNode (element, obj) {
    obj.data = HelperComponent.getComponentData(element)
    obj.name = HelperComponent.getComponentName(obj.data.file)
    obj.isComponent = true
    if (HelperComponent.isComponentHole(element)) {
      obj.isComponentHole = true
      if (obj.draggable) obj.container = true
    }
  },

  addComponentHole (element, obj) {
    obj.isComponentHole = true
    obj.containerOnly = element.closest('[data-ss-component]') &&
      !HelperComponent.isComponentElement(element)
  }
}
