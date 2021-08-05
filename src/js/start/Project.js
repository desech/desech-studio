import DialogComponent from '../component/DialogComponent.js'
import HelperPlugin from '../helper/HelperPlugin.js'
import HelperForm from '../helper/HelperForm.js'
import HelperDesignSystem from '../helper/HelperDesignSystem.js'
import HelperProject from '../helper/HelperProject.js'
import Plugin from './Plugin.js'
import Import from './Import.js'
import HelperDOM from '../helper/HelperDOM.js'

export default {
  newProject (importData) {
    DialogComponent.closeAllDialogs()
    const dialog = this.openProjectSettingsDialog('project-create')
    this.groupNotInstalledPlugins(dialog)
    this.setNewDefaults(dialog)
    this.updateImportDialog(dialog, importData)
  },

  openProjectSettingsDialog (template) {
    return DialogComponent.showDialog({
      header: DialogComponent.getContentHtml(template, 'header'),
      body: DialogComponent.getContentHtml(template, 'body')
    })
  },

  groupNotInstalledPlugins (dialog) {
    const plugins = Plugin.getAllPlugins()
    const fields = dialog.getElementsByClassName('dialog-project')[0].elements
    this.setPluginsOptions(plugins, fields)
  },

  setPluginsOptions (plugins, fields) {
    for (const plugin of plugins) {
      const option = this.getPluginOption(plugin)
      this.injectPluginOption(fields[plugin.category], plugin, option.cloneNode(true))
    }
  },

  getPluginOption (plugin) {
    const option = document.createElement('option')
    option.textContent = plugin.title
    option.setAttributeNS(null, 'value', HelperPlugin.getPluginName(plugin.url))
    return option
  },

  injectPluginOption (select, plugin, option) {
    const group = select.getElementsByTagName('optgroup')[0]
    if (plugin.installed) {
      HelperDOM.insertBefore(option, group)
    } else {
      group.appendChild(option)
      HelperDOM.show(group)
    }
  },

  setNewDefaults (dialog) {
    const fields = dialog.getElementsByClassName('dialog-project')[0].elements
    fields.exportCode.value = 'static'
  },

  updateImportDialog (dialog, importData) {
    if (!importData) return
    const title = Import.getImportTitle(importData.type)
    dialog.getElementsByClassName('dialog-title')[0].textContent = title
    dialog.getElementsByClassName('start-new-project-submit')[0].textContent = title
    const fields = dialog.getElementsByClassName('dialog-project')[0].elements
    fields.import.value = JSON.stringify(importData)
  },

  async newProjectSubmit (form) {
    const values = HelperForm.getFormValues(form)
    const data = {
      settings: {
        responsiveType: values.responsiveType,
        designSystem: values.designSystem,
        exportCode: values.exportCode
      },
      import: values.import ? JSON.parse(values.import) : null
    }
    await window.electron.invoke('rendererInitProject', data)
  },

  async injectDesignSystemCss () {
    const css = await window.electron.invoke('rendererGetDesignSystemCss')
    if (css) HelperDesignSystem.injectDesignSystemCss(css)
  },

  openProjectSettings (settings) {
    const dialog = this.openProjectSettingsDialog('project-update')
    const plugins = Plugin.getAllPlugins()
    this.groupNotInstalledPlugins(dialog, plugins)
    this.addSettingsFields(dialog, settings)
  },

  addSettingsFields (dialog, settings) {
    const fields = dialog.getElementsByClassName('dialog-project')[0].elements
    fields.responsiveType.value = settings.responsiveType
    fields.designSystem.value = settings.designSystem
    fields.exportCode.value = settings.exportCode
  },

  async saveProjectSettings (form) {
    const folder = HelperProject.getFolder()
    const settings = HelperForm.getFormValues(form)
    await window.electron.invoke('rendererInitProject', { folder, settings })
  }
}
