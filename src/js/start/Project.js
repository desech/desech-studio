import DialogComponent from '../component/DialogComponent.js'
import HelperPlugin from '../helper/HelperPlugin.js'
import HelperForm from '../helper/HelperForm.js'
import HelperDesignSystem from '../helper/HelperDesignSystem.js'
import HelperProject from '../helper/HelperProject.js'

export default {
  newProject (plugins) {
    const dialog = this.openProjectSettingsDialog('project-create')
    this.addInstalledPlugins(dialog, plugins)
    this.setNewDefaults(dialog)
  },

  openProjectSettingsDialog (template) {
    return DialogComponent.showDialog({
      header: DialogComponent.getContentHtml(template, 'header'),
      body: DialogComponent.getContentHtml(template, 'body')
    })
  },

  addInstalledPlugins (dialog, plugins) {
    const fields = dialog.getElementsByClassName('dialog-project')[0].elements
    this.setPluginsOptions(plugins, fields.designSystem, fields.exportCode)
  },

  setPluginsOptions (plugins, designSystem, exportCode) {
    for (const plugin of plugins) {
      const option = this.getPluginOption(plugin)
      if (plugin.category === 'designSystem') {
        designSystem.appendChild(option.cloneNode(true))
      } else {
        // exportCode
        exportCode.appendChild(option.cloneNode(true))
      }
    }
  },

  getPluginOption (plugin) {
    const option = document.createElement('option')
    option.textContent = plugin.title
    option.setAttributeNS(null, 'value', HelperPlugin.getPluginName(plugin.url))
    return option
  },

  setNewDefaults (dialog) {
    const fields = dialog.getElementsByClassName('dialog-project')[0].elements
    fields.exportCode.value = 'static'
  },

  async newProjectSubmit (form) {
    const settings = HelperForm.getFormValues(form)
    await window.electron.invoke('rendererOpenProject', settings)
  },

  async injectDesignSystemCss () {
    const css = await window.electron.invoke('rendererGetDesignSystemCss')
    if (css) HelperDesignSystem.injectDesignSystemCss(css)
  },

  openProjectSettings (settings, plugins) {
    const dialog = this.openProjectSettingsDialog('project-update')
    this.addInstalledPlugins(dialog, plugins)
    this.addSettingsFields(dialog, settings)
  },

  addSettingsFields (dialog, settings) {
    const fields = dialog.getElementsByClassName('dialog-project')[0].elements
    fields.responsiveType.value = settings.responsiveType
    fields.designSystem.value = settings.designSystem
    fields.exportCode.value = settings.exportCode
  },

  async saveProjectSettings (form) {
    const settings = HelperForm.getFormValues(form)
    const folder = HelperProject.getFolder()
    await window.electron.invoke('rendererOpenProject', settings, folder)
  }
}
