import LeftCommon from '../LeftCommon.js'
import HelperDOM from '../../../helper/HelperDOM.js'
import HelperFile from '../../../helper/HelperFile.js'
import LeftFileLoad from './LeftFileLoad.js'
import HelperProject from '../../../helper/HelperProject.js'
import TopCommandCommon from '../../top/command/TopCommandCommon.js'

export default {
  async buildList (container, type, list, options) {
    if (options.loadFile) {
      await LeftFileLoad.loadFile(options.loadFile)
      if (options.projectSave) await TopCommandCommon.executeSaveFile()
    }
    await this.insertItems(list)
    LeftCommon.expandStateItems(container, type)
    if (options.callback) options.callback()
    LeftCommon.finishPanelLoad(container, type)
  },

  async insertItems (list) {
    const items = await window.electron.invoke('rendererGetFolder')
    if (items.length) LeftCommon.removeEmptyPrompt(list)
    // save the data for create file/folder
    list.dataset.files = JSON.stringify(items)
    this.injectItems({ children: items }, list)
  },

  injectItems (parent, list, level = 0) {
    for (const item of parent.children) {
      this.injectItem(item, parent, list, level)
      if (item.children) this.injectItems(item, list, level + 1)
    }
  },

  injectItem (data, parent, list, level) {
    const template = HelperDOM.getTemplate('template-file-item')
    if (level) LeftCommon.injectIndentTree(template, level)
    this.injectItemData(template, data, parent, level)
    list.appendChild(template)
  },

  injectItemData (li, data, parent, level) {
    this.injectData(li, data, parent)
    this.injectTitle(li, data)
    this.injectIcon(li, data)
    this.injectDrag(li, data)
    LeftCommon.setItemCollapse(li, data, level)
  },

  injectData (li, data, parent) {
    li.dataset.search = data.name
    li.dataset.ref = data.path
    li.dataset.type = data.type
    li.dataset.extension = data.extension
    li.dataset.parent = parent.path || ''
  },

  injectDrag (li, data) {
    if (data.type === 'folder') li.dataset.container = true
    li.classList.add('dragdrop-element')
    if (!HelperFile.isReadonly(data.path) && !li.classList.contains('loaded')) {
      li.setAttributeNS(null, 'draggable', 'true')
    }
  },

  injectTitle (li, data) {
    const title = li.getElementsByClassName('panel-item-name')[0]
    title.textContent = data.name
    if (HelperProject.getFile() === data.path) li.classList.add('loaded')
  },

  injectIcon (li, data) {
    const container = li.getElementsByClassName('panel-item-icon')[0]
    const icon = this.getExtensionIcon(data.type, data.extension)
    const svg = HelperDOM.getTemplate(`template-file-icon-${icon}`)
    container.appendChild(svg)
  },

  getExtensionIcon (type, ext) {
    switch (ext) {
      case 'html':
        return 'html'
      case 'css':
        return 'css'
      case 'js':
        return 'js'
      case 'woff2':
        return 'font'
      case 'svg':
        return 'svg'
      case 'jpg': case 'jpeg': case 'png': case 'gif': case 'webp': case 'ico':
        return 'image'
      case 'mp4': case 'mkv': case 'webm':
        return 'video'
      case 'mp3': case 'wav':
        return 'audio'
      default:
        // folder or file
        return type
    }
  }
}
