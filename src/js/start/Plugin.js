import DialogComponent from '../component/DialogComponent.js'
import HelperDOM from '../helper/HelperDOM.js'

export default {
  getEvents () {
    return {
      click: ['clickInstallPluginEvent', 'clickRemovePluginEvent']
    }
  },

  async clickInstallPluginEvent (event) {
    if (event.target.closest('.plugin-install')) {
      await this.installPlugin(event.target.closest('.plugin-item-button'))
    }
  },

  async clickRemovePluginEvent (event) {
    if (event.target.closest('.plugin-remove')) {
      await this.removePlugin(event.target.closest('.plugin-item-button'))
    }
  },

  getAllPlugins () {
    return JSON.parse(document.body.dataset.plugins)
  },

  openPlugins () {
    const dialog = this.showPluginOverlay()
    const container = dialog.getElementsByClassName('plugin-list')[0]
    const plugins = this.getAllPlugins()
    this.injectPlugins(container, plugins)
  },

  showPluginOverlay () {
    return DialogComponent.showDialog({
      header: DialogComponent.getContentHtml('plugin', 'header'),
      body: DialogComponent.getContentHtml('plugin', 'body')
    })
  },

  injectPlugins (container, plugins) {
    const template = HelperDOM.getTemplate('template-dialog-plugin-item')
    const categories = JSON.parse(container.dataset.categories)
    for (const plugin of plugins) {
      const node = template.cloneNode(true)
      this.injectPluginData(node, plugin, categories)
      container.appendChild(node)
    }
  },

  injectPluginData (node, plugin, categories) {
    node.getElementsByClassName('plugin-name')[0].textContent = plugin.title
    node.getElementsByClassName('plugin-meta')[0].textContent = plugin.author + ', ' +
      categories[plugin.category]
    node.getElementsByClassName('plugin-item-button')[0].dataset.url = plugin.url
    node.getElementsByClassName('plugin-link')[0].href = plugin.url
    if (plugin.installed) this.injectRemoveButton(node, plugin.url)
  },

  injectRemoveButton (node, url) {
    const button = node.getElementsByClassName('plugin-remove')[0]
    HelperDOM.hide(button.previousElementSibling)
    HelperDOM.show(button)
  },

  async installPlugin (button) {
    this.switchToLoading(button.closest('.content'))
    await window.electron.invoke('rendererInstallPlugin', button.dataset.url)
  },

  switchToLoading (content) {
    HelperDOM.hide(content)
    HelperDOM.show(content.nextElementSibling)
  },

  async removePlugin (button) {
    this.switchToLoading(button.closest('.content'))
    await window.electron.invoke('rendererRemovePlugin', button.dataset.url)
  }
}
