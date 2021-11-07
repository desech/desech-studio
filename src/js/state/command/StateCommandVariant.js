import HelperComponent from '../../helper/HelperComponent.js'
import StateCommandOverride from './StateCommandOverride.js'
import HelperTrigger from '../../helper/HelperTrigger.js'

export default {
  async saveVariant (element, name, value) {
    const component = HelperComponent.getComponentData(element)
    StateCommandOverride.addVariantToMain(component, name, value)
    await window.electron.invoke('rendererSaveComponentData', component.file, component.main)
    delete component.overrides
    StateCommandOverride.updateVariantInstance(element, component, name, value)
    StateCommandOverride.saveMainDataAllComponents(component.file, component.main)
    HelperTrigger.triggerReload('component-section')
  },

  async deleteVariant (element, name, value, undo) {
    const component = HelperComponent.getComponentData(element)
    const overrides = StateCommandOverride.deleteVariantFromMain(component, name, value)
    await window.electron.invoke('rendererSaveComponentData', component.file, component.main)
    if (undo) {
      StateCommandOverride.undoVariantFromInstance(element, component, name, overrides)
    } else { // @todo
      console.log('delete variant from all component instances in all files')
    }
  },

  async switchVariant (element, name, value) {
    const component = HelperComponent.getComponentData(element)
    StateCommandOverride.updateVariantInstance(element, component, name, value)
    await HelperComponent.replaceComponent(element, component)
  }
}
