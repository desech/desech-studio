import HelperComponent from '../../helper/HelperComponent.js'
import HelperTrigger from '../../helper/HelperTrigger.js'
import LeftFileLoad from '../../main/left/file/LeftFileLoad.js'
import ExtendJS from '../../helper/ExtendJS.js'
import HelperCanvas from '../../helper/HelperCanvas.js'
import HelperFile from '../../helper/HelperFile.js'
import StateCommandOverride from './StateCommandOverride.js'
import TopCommandCommon from '../../main/top/command/TopCommandCommon.js'
import StyleSheetComponent from '../stylesheet/StyleSheetComponent.js'
import HelperElement from '../../helper/HelperElement.js'
import StateSelectedElement from '../StateSelectedElement.js'
import StyleSheetSelector from '../stylesheet/StyleSheetSelector.js'
import StateStyleSheet from '../StateStyleSheet.js'
import StateCommandCommon from './StateCommandCommon.js'

export default {
  async createVariant (component, obj) {
    const data = HelperComponent.getComponentData(component)
    this.addVariantToMain(data, obj.name, obj.value, obj.overrides)
    await window.electron.invoke('rendererSaveComponentData', data.file, data.main)
    if (obj.newVariant) {
      // this happens when we create a new variant from overrides
      this.addVariantToInstances(component, data, obj)
    } else {
      // this happens when we undo a variant delete
      await this.undoDeleteVariant(component, data, obj)
    }
  },

  addVariantToMain (data, name, value, overrides) {
    if (!data.main) data.main = {}
    if (!data.main.variants) data.main.variants = {}
    if (!data.main.variants[name]) data.main.variants[name] = {}
    // if the variant already exists, it will override it
    // when we only have style overrides, we need to set this to null
    data.main.variants[name][value] = overrides || null
  },

  addVariantToInstances (component, data, obj) {
    delete data.overrides
    this.updateVariantInstance(component, obj.name, obj.value, data)
    this.saveMainDataAllComponents(data.file, data.main)
    StyleSheetComponent.convertOverrideToVariant(data, obj.name, obj.value)
    HelperTrigger.triggerReload('component-section')
  },

  updateVariantInstance (component, name, value, data) {
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

  async undoDeleteVariant (component, data, obj) {
    // we need to set the variant again; the overrides were already set by addVariantToMain()
    this.updateVariantInstance(component, obj.name, obj.value, data)
    StateStyleSheet.addSelectors(obj.style)
    // @todo because of reload and ParseHtml removing the missing variants, we end up clearing
    // the variant value in other components, so it's not a clean undo
    await this.saveReload()
  },

  async saveReload () {
    // we need to save before reloading the html and css files
    await TopCommandCommon.executeSaveFile()
    await LeftFileLoad.reloadCurrentFile()
  },

  async deleteVariant (component, obj) {
    const data = HelperComponent.getComponentData(component)
    const overrides = this.deleteVariantFromMain(data, obj.name, obj.value)
    await window.electron.invoke('rendererSaveComponentData', data.file, data.main)
    if (obj.newVariant) {
      // this happens when we undo a variant create
      this.undoCreateVariantInInstances(component, data, obj.name, obj.value, overrides)
    } else {
      // this happens when we delete an existing variant which can be used by other instances
      StyleSheetSelector.deleteSelectors(Object.keys(obj.style))
      await this.saveReload()
    }
  },

  deleteVariantFromMain (data, name, value) {
    const overrides = ExtendJS.cloneData(data.main.variants[name][value])
    delete data.main.variants[name][value]
    ExtendJS.clearEmptyObjects(data)
    return overrides
  },

  undoCreateVariantInInstances (component, data, name, value, overrides) {
    data.overrides = overrides
    delete data.variants[name]
    HelperComponent.setComponentData(component, data)
    this.saveMainDataAllComponents(data.file, data.main)
    StyleSheetComponent.convertVariantToOverride(data, name, value)
  },

  async updateVariant (component, obj) {
    const data = HelperComponent.getComponentData(component)
    this.addVariantToMain(data, obj.name, obj.value, obj.variantOverrides)
    await window.electron.invoke('rendererSaveComponentData', data.file, data.main)
    this.updateVariantStyle(data, obj)
    await this.resetOverridesSaveFile(component, data, obj)
  },

  updateVariantStyle (data, obj) {
    switch (obj.styleAction) {
      case 'convert':
        StyleSheetComponent.convertOverrideToVariant(data, obj.name, obj.value)
        break
      case 'revert':
        StyleSheetComponent.revertStyle(data, obj.name, obj.value, obj.style)
        break
      default:
        throw new Error('Unknown style action on update variant')
    }
  },

  async resetOverridesSaveFile (component, data, obj) {
    HelperComponent.updateComponentData(data, 'overrides', obj.overrides)
    HelperComponent.setComponentData(component, data)
    await this.saveReload()
  },

  async renameVariant (component, values) {
    const data = HelperComponent.getComponentData(component)
    this.renameVariantInMain(data.main.variants, values)
    await window.electron.invoke('rendererSaveComponentData', data.file, data.main)
    await this.renameStyle(data, values)
    const file = HelperFile.getRelPath(data.file)
    await window.electron.invoke('rendererRenameVariant', file, values)
    // we only need to reload because files have already been saved
    await LeftFileLoad.reloadCurrentFile()
  },

  async renameStyle (data, values) {
    // change the css and then save the file before we reload the current file
    StyleSheetComponent.renameVariant(data, values)
    await TopCommandCommon.executeSaveFile()
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
  },

  async switchVariant (component, name, value) {
    const data = HelperComponent.getComponentData(component)
    if (HelperComponent.isComponentElement(component)) {
      await this.switchOverrideVariant(data, name, value, component)
    } else {
      this.updateVariantInstance(component, name, value, data)
      await StateCommandCommon.replaceComponent(component, data)
    }
    HelperTrigger.triggerReload('right-panel')
  },

  async switchOverrideVariant (data, name, value, component) {
    const parents = await StateCommandOverride.overrideComponent(component, 'variants',
      { name, value })
    await StateCommandCommon.replaceComponent(parents[0].element, parents[0].data, data.ref)
  }
}
