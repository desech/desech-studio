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
import HelperEvent from '../../helper/HelperEvent.js'
import HelperElement from '../../helper/HelperElement.js'
import StateSelectedElement from '../../state/StateSelectedElement.js'
import RightCommon from './RightCommon.js'
import HelperComponent from '../../helper/HelperComponent.js'

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
    if (!element) return
    if (HelperComponent.isComponent(element)) {
      return {
        component: RightComponent,
        html: RightHtml,
        selector: RightSelector
      }
    } else {
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

  getList (classes, data) {
    const sections = []
    for (const [name, obj] of Object.entries(classes)) {
      this.pushSectionToList(sections, name, obj, data)
    }
    return sections
  },

  pushSectionToList (sections, name, obj, data) {
    const node = this.getSection(obj, data)
    if (!this.isSectionAllowed(name)) this.disableSection(node)
    sections.push(node)
  },

  getSection (obj, data) {
    const container = obj.getSection(data)
    if (container) RightCommon.processToggle(container)
    return container
  },

  isSectionAllowed (section) {
    if (section === 'component') return true
    const elementType = HelperElement.getType(StateSelectedElement.getElement())
    const panels = this.getSubPanelsByType(elementType)
    return !panels || panels.includes(section)
  },

  // the order is set in RightSection.getSubSectionClasses()
  getSubPanelsByType (elementType) {
    const top = ['html', 'selector', 'size', 'grid']
    const bottom = ['effect', 'animation', 'css']
    switch (elementType) {
      case 'body':
      case 'block':
      case 'text':
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
    const data = RightCommon.getElementSectionData()
    if (!data) return
    const classes = { ...this.getSectionClasses(), ...this.getSubSectionClasses() }
    for (const [label, obj] of Object.entries(classes)) {
      if (label === name) return this.getSection(obj, data)
    }
  },

  clearSection (name) {
    HelperDOM.deleteChildren(this.getContainer(name))
  },

  getContainer (name) {
    return document.getElementById(name.toLowerCase() + '-section')
  },

  loadSection (section, container) {
    if (!container || !section) return
    container.parentNode.replaceChild(section, container)
  }
}
