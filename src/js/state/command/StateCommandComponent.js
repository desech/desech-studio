import HelperElement from '../../helper/HelperElement.js'
import HelperComponent from '../../helper/HelperComponent.js'
import StateSelectedElement from '../StateSelectedElement.js'

export default {
  async replaceComponent (element, data, subRef = null) {
    const ref = HelperElement.getRef(element)
    const children = HelperComponent.getInstanceChildren(element)
    const component = await HelperComponent.fetchComponent(data)
    element.replaceWith(component)
    HelperElement.replacePositionRef(component, ref)
    if (children) HelperComponent.setInstanceChildren(component, children)
    this.selectReplaceComponent(component, subRef)
  },

  selectReplaceComponent (component, subCmpRef) {
    // the positioning refs of the component elements get replaced, so undo will not work
    // anymore on the previous actions of the component elements
    if (subCmpRef) {
      // select this sub component instead
      const subComponent = HelperElement.getElement(subCmpRef)
      StateSelectedElement.selectElement(subComponent)
    } else {
      StateSelectedElement.selectElement(component)
    }
  },

  async swapNormalComponent (element, data) {
    const componentData = HelperComponent.getComponentData(element)
    HelperComponent.updateComponentData(componentData, 'file', data.file)
    HelperComponent.setComponentData(element, componentData)
    await this.replaceComponent(element, componentData)
  }
}
