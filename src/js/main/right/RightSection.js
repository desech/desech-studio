import HelperDOM from '../../helper/HelperDOM.js'
import RightHtml from './section/RightHtml.js'
import RightSelector from './section/RightSelector.js'
import RightSize from './section/RightSize.js'
import RightGrid from './section/RightGrid.js'
import RightText from './section/RightText.js'
import RightBorder from './section/RightBorder.js'
import RightFill from './section/RightFill.js'
import RightEffect from './section/RightEffect.js'
import RightAnimation from './section/RightAnimation.js'
import RightCSS from './section/RightCSS.js'
import RightComponent from './section/RightComponent.js'
import RightComponentChildren from './section/RightComponentChildren.js'
import HelperEvent from '../../helper/HelperEvent.js'
import HelperElement from '../../helper/HelperElement.js'
import StateSelectedElement from '../../state/StateSelectedElement.js'
import RightCommon from './RightCommon.js'

export default {
  getEvents () {
    return {
      reloadcontainer: ['reloadcontainerEvent'],
      click: ['clickToggleSectionEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  reloadcontainerEvent (event) {
    if (event.target.classList.contains('sidebar-section')) {
      this.reloadSection(event.target.dataset.type, event.detail)
    }
  },

  clickToggleSectionEvent (event) {
    if (event.target.closest('.sidebar-title-text')) {
      RightCommon.toggleSection(event.target.closest('form'))
    }
  },

  getSectionClasses () {
    const element = StateSelectedElement.getElement()
    const type = HelperElement.getType(element)
    switch (type) {
      case 'component':
        return { component: RightComponent }
      case 'component-children':
        return { componentChildren: RightComponentChildren }
      default:
        return {
          html: RightHtml,
          selector: RightSelector
        }
    }
  },

  // this sets the order in which they appear in the style panel
  getSubSectionClasses () {
    return {
      size: RightSize,
      grid: RightGrid,
      text: RightText,
      border: RightBorder,
      fill: RightFill,
      effect: RightEffect,
      animation: RightAnimation,
      css: RightCSS
    }
  },

  reloadSection (name, options) {
    this.clearSection(name)
    this.loadSection(this.getSectionByName(name), this.getContainer(name))
    if (options && options.callback) options.callback(options.arg1)
  },

  getList (classes) {
    const sections = []
    for (const [name, obj] of Object.entries(classes)) {
      this.pushSectionToList(sections, name, obj)
    }
    return sections
  },

  pushSectionToList (sections, name, obj) {
    const node = this.getSection(obj)
    if (!node) return
    if (!this.isSectionAllowed(name)) this.disableSection(node)
    sections.push(node)
  },

  getSection (obj) {
    const style = StateSelectedElement.getStyle()
    const container = obj.getSection(style)
    if (container) RightCommon.processToggle(container)
    return container
  },

  isSectionAllowed (name) {
    const elementType = HelperElement.getType(StateSelectedElement.getElement())
    const panels = this.getSubPanelsByType(elementType)
    return !panels || panels.includes(name)
  },

  // the order is set in RightSection.getSubSectionClasses()
  getSubPanelsByType (elementType) {
    const top = ['html', 'selector', 'size']
    const bottom = ['effect', 'animation', 'css']
    switch (elementType) {
      case 'block':
        return top + ['grid', 'text', 'border', 'fill'] + bottom

      case 'text':
        return top + ['text', 'border', 'fill'] + bottom

      case 'input':
      case 'dropdown':
      case 'textarea':
        return top + ['text', 'border', 'fill'] + bottom

      case 'icon':
      case 'checkbox':
      case 'color':
      case 'canvas':
        return top + ['border', 'fill'] + bottom

      case 'image':
      case 'video':
      case 'iframe':
      case 'object':
        return top + ['border'] + bottom

      case 'file':
        return top + ['fill'] + bottom

      case 'inline':
        return ['html', 'selector', 'size'] + ['text', 'border', 'fill'] + bottom

      // audio, range, datalist, progress, meter
      default:
        return top + bottom
    }
  },

  disableSection (container) {
    container.classList.remove('active')
  },

  addToPanel (sections, container) {
    for (const section of sections) {
      container.appendChild(section)
    }
  },

  getSectionByName (name) {
    const classes = { ...this.getSectionClasses(), ...this.getSubSectionClasses() }
    for (const [label, obj] of Object.entries(classes)) {
      if (label === name) return this.getSection(obj)
    }
  },

  clearSection (name) {
    HelperDOM.deleteChildren(this.getContainer(name))
  },

  getContainer (name) {
    return document.getElementById(name.toLowerCase() + '-section')
  },

  loadSection (section, container) {
    container.parentNode.replaceChild(section, container)
  }
}
