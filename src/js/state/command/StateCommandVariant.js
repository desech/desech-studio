import HelperComponent from '../../helper/HelperComponent.js'
import HelperTrigger from '../../helper/HelperTrigger.js'
import LeftFileLoad from '../../main/left/file/LeftFileLoad.js'
import CanvasElementSelect from '../../main/canvas/element/CanvasElementSelect.js'
import ExtendJS from '../../helper/ExtendJS.js'
import HelperCanvas from '../../helper/HelperCanvas.js'
import HelperFile from '../../helper/HelperFile.js'

export default {
  async saveVariant (element, name, value, overrides, undo) {
    const data = HelperComponent.getComponentData(element)
    this.addVariantToMain(data, name, value, overrides)
    await window.electron.invoke('rendererSaveComponentData', data.file, data.main)
    if (!undo) {
      // this happens when we create a new variant from overrides
      this.addVariantToInstances(element, name, value, data)
    } else {
      // this happens when we undo a variant delete
      await this.reloadSelectComponent(data.ref)
    }
  },

  addVariantToMain (data, name, value, overrides) {
    if (!data.main) data.main = {}
    if (!data.main.variants) data.main.variants = {}
    if (!data.main.variants[name]) data.main.variants[name] = {}
    data.main.variants[name][value] = overrides
  },

  addVariantToInstances (element, name, value, data) {
    delete data.overrides
    this.updateVariantInstance(element, data, name, value)
    this.saveMainDataAllComponents(data.file, data.main)
    HelperTrigger.triggerReload('component-section')
  },

  updateVariantInstance (element, data, name, value) {
    if (!data.variants) data.variants = {}
    if (value) {
      data.variants[name] = value
    } else {
      delete data.variants[name]
    }
    HelperComponent.setComponentData(element, data)
  },

  saveMainDataAllComponents (file, mainData) {
    const components = HelperCanvas.getCanvas().querySelectorAll(`[data-ss-component*="${file}"]`)
    for (const component of components) {
      const data = HelperComponent.getComponentData(component)
      data.main = mainData
      HelperComponent.setComponentData(component, data)
    }
  },

  async deleteVariant (element, name, value, undo) {
    const data = HelperComponent.getComponentData(element)
    const overrides = this.deleteVariantFromMain(data, name, value)
    await window.electron.invoke('rendererSaveComponentData', data.file, data.main)
    if (undo) {
      // this happens when we undo a variant create
      this.deleteVariantFromInstances(element, data, name, overrides)
    } else {
      // this happens when we delete an existing variant which can be used by other instances
      await this.reloadSelectComponent(data.ref)
    }
  },

  deleteVariantFromMain (data, name, value) {
    const overrides = ExtendJS.cloneData(data.main.variants[name][value])
    delete data.main.variants[name][value]
    ExtendJS.clearEmptyObjects(data)
    return overrides
  },

  deleteVariantFromInstances (element, data, name, overrides) {
    data.overrides = overrides
    delete data.variants[name]
    HelperComponent.setComponentData(element, data)
    this.saveMainDataAllComponents(data.file, data.main)
  },

  async reloadSelectComponent (ref) {
    await LeftFileLoad.reloadCurrentFile()
    const element = HelperComponent.getByRef(ref)
    CanvasElementSelect.selectElementNode(element)
  },

  async switchVariant (element, name, value) {
    const component = HelperComponent.getComponentData(element)
    this.updateVariantInstance(element, component, name, value)
    await HelperComponent.replaceComponent(element, component)
  },

  async renameVariant (element, data) {
    const component = HelperComponent.getComponentData(element)
    this.renameVariantInMain(component.main.variants, data.values)
    await window.electron.invoke('rendererSaveComponentData', component.file, component.main)
    const file = HelperFile.getRelPath(component.file)
    await window.electron.invoke('rendererRenameVariant', file, data.values)
    await this.reloadSelectComponent(data.ref)
  },

  renameVariantInMain (variants, data) {
    if (data.name !== data.oldName) {
      variants[data.name] = ExtendJS.cloneData(variants[data.oldName])
      delete variants[data.oldName]
    }
    if (data.value !== data.oldValue) {
      variants[data.name][data.value] = ExtendJS.cloneData(variants[data.name][data.oldValue])
      delete variants[data.name][data.oldValue]
    }
  }
}
