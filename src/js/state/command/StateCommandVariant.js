import HelperComponent from '../../helper/HelperComponent.js'
import HelperTrigger from '../../helper/HelperTrigger.js'
import LeftFileLoad from '../../main/left/file/LeftFileLoad.js'
import ExtendJS from '../../helper/ExtendJS.js'
import HelperCanvas from '../../helper/HelperCanvas.js'
import HelperFile from '../../helper/HelperFile.js'
import StateCommandOverride from './StateCommandOverride.js'
import TopCommandCommon from '../../main/top/command/TopCommandCommon.js'

export default {
  async createVariant (component, obj) {
    const data = HelperComponent.getComponentData(component)
    this.addVariantToMain(data, obj.name, obj.value, obj.overrides)
    await window.electron.invoke('rendererSaveComponentData', data.file, data.main)
    if (obj.newVariant) {
      // this happens when we create a new variant from overrides
      this.addVariantToInstances(data, obj.name, obj.value, component)
    } else {
      // this happens when we undo a variant delete
      await LeftFileLoad.reloadCurrentFile()
    }
  },

  addVariantToMain (data, name, value, overrides) {
    if (!data.main) data.main = {}
    if (!data.main.variants) data.main.variants = {}
    if (!data.main.variants[name]) data.main.variants[name] = {}
    // if the variant already exists, it will override it
    data.main.variants[name][value] = overrides
  },

  addVariantToInstances (data, name, value, component) {
    delete data.overrides
    this.updateVariantInstance(data, name, value, component)
    this.saveMainDataAllComponents(data.file, data.main)
    HelperTrigger.triggerReload('component-section')
  },

  updateVariantInstance (data, name, value, component) {
    if (!data.variants) data.variants = {}
    HelperComponent.updateComponentData(data.variants, name, value)
    HelperComponent.setComponentData(component, data)
  },

  // this only applies to new variants which are no used yet
  // for existing variants, we will reload the file to make sure we have the proper overrides
  saveMainDataAllComponents (file, mainData) {
    const components = HelperCanvas.getCanvas().querySelectorAll('[data-ss-component]')
    for (const component of components) {
      const data = HelperComponent.getComponentData(component)
      if (data.file !== file) continue
      data.main = mainData
      HelperComponent.setComponentData(component, data)
    }
  },

  async updateVariant (component, obj) {
    const data = HelperComponent.getComponentData(component)
    this.addVariantToMain(data, obj.name, obj.value, obj.variantOverrides)
    await window.electron.invoke('rendererSaveComponentData', data.file, data.main)
    await this.resetOverridesSaveFile(component, data, obj.overrides)
    await LeftFileLoad.reloadCurrentFile()
  },

  async resetOverridesSaveFile (component, data, overrides) {
    HelperComponent.updateComponentData(data, 'overrides', overrides)
    HelperComponent.setComponentData(component, data)
    await TopCommandCommon.executeSaveFile()
  },

  async deleteVariant (component, obj) {
    const data = HelperComponent.getComponentData(component)
    const overrides = this.deleteVariantFromMain(data, obj.name, obj.value)
    await window.electron.invoke('rendererSaveComponentData', data.file, data.main)
    if (obj.newVariant) {
      // this happens when we undo a variant create
      this.undoCreateVariantInInstances(component, data, obj.name, overrides)
    } else {
      // this happens when we delete an existing variant which can be used by other instances
      await LeftFileLoad.reloadCurrentFile()
    }
  },

  deleteVariantFromMain (data, name, value) {
    const overrides = ExtendJS.cloneData(data.main.variants[name][value])
    delete data.main.variants[name][value]
    ExtendJS.clearEmptyObjects(data)
    return overrides
  },

  undoCreateVariantInInstances (component, data, name, overrides) {
    data.overrides = overrides
    delete data.variants[name]
    HelperComponent.setComponentData(component, data)
    // update all components' main data
    this.saveMainDataAllComponents(data.file, data.main)
  },

  async switchVariant (component, name, value) {
    const data = HelperComponent.getComponentData(component)
    if (HelperComponent.isComponentElement(component)) {
      await this.switchOverrideVariant(data, name, value, component)
    } else {
      this.updateVariantInstance(data, name, value, component)
      await HelperComponent.replaceComponent(component, data)
    }
    HelperTrigger.triggerReload('right-panel')
  },

  async switchOverrideVariant (data, name, value, component) {
    const parents = await StateCommandOverride.overrideComponent(component, 'variants',
      { name, value })
    return await HelperComponent.replaceComponent(parents[0].element, parents[0].data)
  },

  async renameVariant (component, values) {
    const data = HelperComponent.getComponentData(component)
    this.renameVariantInMain(data.main.variants, values)
    await window.electron.invoke('rendererSaveComponentData', data.file, data.main)
    const file = HelperFile.getRelPath(data.file)
    await window.electron.invoke('rendererRenameVariant', file, values)
    await LeftFileLoad.reloadCurrentFile()
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
