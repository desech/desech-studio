import HelperCanvas from '../../../helper/HelperCanvas.js'
import HelperElement from '../../../helper/HelperElement.js'
import HelperDOM from '../../../helper/HelperDOM.js'
import StateSelectedElement from '../../../state/StateSelectedElement.js'
import LeftCommon from '../LeftCommon.js'
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
    data.component ? this.injectComponentDrag(li, data) : this.injectDrag(li, data)
    this.injectTitle(li, data)
    this.injectIcon(li, data)
    this.injectHiddenUnrender(li, data)
    LeftCommon.setItemCollapse(li, data, level)
  },

  injectData (li, data, parent) {
    li.dataset.ref = data.ref
    li.dataset.parent = parent.ref || ''
  },

  injectSearch (li, data) {
    li.dataset.search = [data.ref, data.styleRef, data.type].join('-')
    if (data.classes.length) li.dataset.search += '-' + data.classes.join('-')
    if (data.component?.isComponentHole) li.dataset.search += '-hole'
    if (data.component?.data) {
      li.dataset.search += '-' + [data.component.data.ref, data.component.name].join('-')
    }
  },

  injectSelection (li, data) {
    const selected = StateSelectedElement.getRef()
    if (selected === data.ref) li.classList.add('active')
  },

  injectComponentDrag (li, data) {
    if (data.component.containerOnly) li.dataset.containerOnly = true
    if (data.component.container) li.dataset.container = true
    if (data.component.draggable) li.setAttributeNS(null, 'draggable', 'true')
    if (data.component.draggable || data.component.containerOnly) {
      li.classList.add('dragdrop-element')
    }
  },

  injectDrag (li, data) {
    if (['body', 'inline'].includes(data.type)) return
    if (data.isContainer) li.dataset.container = true
    li.classList.add('dragdrop-element')
    li.setAttributeNS(null, 'draggable', 'true')
  },

  injectTitle (li, data) {
    const title = li.getElementsByClassName('panel-item-name')[0]
    if (data.component?.name) {
      title.textContent = data.component.name
    } else {
      const classes = HelperElement.getClasses(data.element.classList, true)
      title.textContent = `<${data.tag}> ` + classes.join(' ')
    }
  },

  injectIcon (li, data) {
    const icon = li.getElementsByClassName('panel-item-icon')[0]
    const svg = HelperDOM.getTemplate(`template-element-icon-${this.getIconType(data)}`)
    if (svg) icon.appendChild(svg)
  },

  getIconType (data) {
    if (data.component?.isComponent && data.component?.isComponentHole) {
      return 'component-and-hole'
    } else if (data.component?.isComponent) {
      return 'component'
    } else if (data.component?.isComponentHole) {
      return 'component-hole'
    } else {
      return data.type
    }
  },

  injectHiddenUnrender (li, data) {
    // we can't have both the hidden and the unrender icon
    if (data.hidden) {
      HelperDOM.show(li.getElementsByClassName('panel-item-hidden')[0])
    } else if (data.unrender) {
      HelperDOM.show(li.getElementsByClassName('panel-item-unrender')[0])
    }
    // this checks for deep parents that are hidden or unrendered
    if (HelperDOM.isHidden(data.element, true)) {
      li.classList.add('hidden')
    }
    if (HelperElement.isUnrender(data.element, true)) {
      li.classList.add('unrender')
    }
  }
}
