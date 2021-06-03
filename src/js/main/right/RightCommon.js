import StateStyleSheet from '../../state/StateStyleSheet.js'
import ExtendJS from '../../helper/ExtendJS.js'
import StateCommand from '../../state/StateCommand.js'
import HelperCanvas from '../../helper/HelperCanvas.js'
import StyleSheetSelector from '../../state/stylesheet/StyleSheetSelector.js'
import HelperDOM from '../../helper/HelperDOM.js'
import HelperLocalStore from '../../helper/HelperLocalStore.js'
import CanvasCommon from '../canvas/CanvasCommon.js'
import StateSelectedElement from '../../state/StateSelectedElement.js'

export default {
  changeStyle (properties, panelReload = false, doCommand = 'changeStyle') {
    const selector = StyleSheetSelector.getCurrentSelector()
    const command = this.initStyleCommand(selector, doCommand)
    this.setStyleProperties(command, properties, selector)
    this.runCommand(command, panelReload)
    CanvasCommon.hideElementOverlay(Object.keys(properties))
  },

  initStyleCommand (selector, doCommand = 'changeStyle') {
    const responsive = HelperCanvas.getCurrentResponsiveWidth()
    return {
      do: {
        command: doCommand,
        selector,
        responsive,
        properties: {}
      },
      undo: {
        command: 'changeStyle',
        selector,
        responsive,
        properties: {}
      }
    }
  },

  setStyleProperties (command, properties, selector) {
    for (const [name, value] of Object.entries(properties)) {
      if (!name) continue
      command.do.properties[name] = value
      command.undo.properties[name] = StateStyleSheet.getPropertyValue(name, selector)
    }
  },

  runCommand (command, panelReload) {
    if (ExtendJS.isEmpty(command.do.properties)) return
    // we don't want to wait for the stacking to take effect, so no await
    StateCommand.stackCommand(command)
    StateCommand.executeCommand(command.do, true, panelReload)
  },

  processToggle (container) {
    this.toggleSidebarSection(container)
    if (HelperLocalStore.getItem(this.getToggleKey(container))) {
      this.toggleSection(container)
    }
  },

  toggleSidebarSection (container) {
    const check = this.sidebarHasContent(container)
    container.classList.toggle('toggle', check)
    container.classList.add('active')
  },

  sidebarHasContent (container) {
    let found = false
    const lists = container.getElementsByClassName('sidebar-content-list')
    for (const list of lists) {
      if (list.children.length) {
        found = true
        break
      }
    }
    return found
  },

  toggleSection (container) {
    if (!container.classList.contains('toggle')) return
    if (container.classList.contains('active')) {
      this.toggleSectionOff(container)
    } else {
      this.toggleSectionOn(container)
    }
  },

  toggleSectionOff (container) {
    container.classList.remove('active')
    const key = this.getToggleKey(container)
    HelperLocalStore.setItem(key, '1')
  },

  toggleSectionOn (container) {
    container.classList.add('active')
    const key = this.getToggleKey(container)
    HelperLocalStore.removeItem(key)
  },

  getToggleKey (container) {
    const type = container.dataset.type
    return `right-section-${type}-collapse`
  },

  injectPropertyFields (form) {
    const properties = StateSelectedElement.getElementProperties()
    if (!properties) return
    const list = form.getElementsByClassName('style-component-list')[0]
    for (const [name, value] of Object.entries(properties)) {
      this.injectPropertyElement(list, name, value)
    }
  },

  injectPropertyElement (list, name = null, value = null) {
    const template = HelperDOM.getTemplate('template-style-component-property')
    const fields = template.getElementsByClassName('style-component-property-field')
    if (name) this.setPropertyInputs(fields, name, value)
    list.appendChild(template)
  },

  setPropertyInputs (fields, name, value) {
    fields[0].value = name
    fields[1].value = value
  }
}
