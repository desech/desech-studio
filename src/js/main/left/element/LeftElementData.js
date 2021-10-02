import HelperCanvas from '../../../helper/HelperCanvas.js'
import HelperElement from '../../../helper/HelperElement.js'
import HelperDOM from '../../../helper/HelperDOM.js'
import StateSelectedElement from '../../../state/StateSelectedElement.js'
import LeftCommon from '../LeftCommon.js'
import HelperProject from '../../../helper/HelperProject.js'
import LeftElementCommon from './LeftElementCommon.js'

export default {
  async buildList (container, type, list, options) {
    const items = LeftElementCommon.getElements(HelperCanvas.getCanvas())
    if (items.length) LeftCommon.removeEmptyPrompt(list)
    this.injectItems({ children: items }, list)
    LeftCommon.expandStateItems(container, type)
    LeftCommon.finishPanelLoad(container, type)
  },

  injectItems (parent, list, level = 0) {
    for (const item of parent.children) {
      this.injectItem(item, parent, list, level)
      if (item.children.length) this.injectItems(item, list, level + 1)
    }
  },

  injectItem (data, parent, list, level) {
    const template = HelperDOM.getTemplate('template-element-item')
    if (level) LeftCommon.injectIndentTree(template, level)
    this.injectItemData(template, data, parent, level)
    list.appendChild(template)
  },

  injectItemData (li, data, parent, level) {
    this.injectData(li, data, parent)
    this.injectSearch(li, data)
    this.injectSelection(li, data)
    this.injectDrag(li, data)
    this.injectTitle(li, data)
    this.injectIcon(li, data)
    this.injectHidden(li, data)
    LeftCommon.setItemCollapse(li, data, level)
  },

  injectData (li, data, parent) {
    li.dataset.search = [data.ref, data.type].join('-')
    li.dataset.ref = data.ref
    li.dataset.parent = parent.ref || ''
  },

  injectSearch (li, data) {
    if (data.classes.length) li.dataset.search += '-' + data.classes.join('-')
    if (data.type === 'component') {
      const src = data.element.getAttributeNS(null, 'src')
      li.dataset.search += '-' + HelperProject.getFileName(src)
    }
  },

  injectSelection (li, data) {
    const selected = StateSelectedElement.getRef()
    if (selected === data.ref) li.classList.add('active')
  },

  injectDrag (li, data) {
    if (data.type === 'body' || data.type === 'inline') return
    if (data.isContainer) li.dataset.container = true
    li.classList.add('dragdrop-element')
    li.setAttributeNS(null, 'draggable', 'true')
  },

  injectTitle (li, data) {
    const title = li.getElementsByClassName('panel-item-name')[0]
    if (data.type === 'component') {
      title.textContent = HelperProject.getFileName(data.element.getAttributeNS(null, 'src'))
    } else if (data.type === 'component-children') {
      title.textContent = title.dataset.componentChildren
    } else {
      const classes = HelperElement.getClasses(data.element, true)
      title.textContent = `<${data.tag}> ` + classes.join(' ')
    }
  },

  injectIcon (li, data) {
    const icon = li.getElementsByClassName('panel-item-icon')[0]
    const svg = HelperDOM.getTemplate(`template-element-icon-${data.type}`)
    if (svg) icon.appendChild(svg)
  },

  injectHidden (li, data) {
    if (data.hidden) HelperDOM.show(li.getElementsByClassName('panel-item-hidden')[0])
    if (!HelperDOM.isVisible(data.element, true)) li.classList.add('hidden')
  }
}
