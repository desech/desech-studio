import HelperElement from '../../../helper/HelperElement.js'
import HelperComponent from '../../../helper/HelperComponent.js'

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
      component: this.getComponentData(element)
    }
  },

  getComponentData (element) {
    if (!HelperComponent.belongsToAComponent(element)) return null
    const comp = {
      draggable: (element === HelperComponent.getMovableElement(element))
    }
    if (HelperComponent.isComponent(element)) {
      this.addComponentNode(element, comp)
    } else if (HelperComponent.isComponentHole(element)) {
      this.addComponentHole(element, comp)
    } else {
      comp.isElement = true
    }
    return comp
  },

  addComponentNode (element, comp) {
    comp.data = HelperComponent.getComponentInstanceData(element)
    comp.name = HelperComponent.getComponentInstanceName(null, comp.data.file)
    comp.isComponent = true
    if (HelperComponent.isComponentHole(element)) {
      comp.isComponentHole = true
      if (comp.draggable) comp.container = true
    }
  },

  addComponentHole (element, comp) {
    comp.isComponentHole = true
    comp.containerOnly = element.closest('[data-ss-component]')
  }
}
