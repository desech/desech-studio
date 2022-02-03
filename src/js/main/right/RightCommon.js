import StateStyleSheet from '../../state/StateStyleSheet.js'
import ExtendJS from '../../helper/ExtendJS.js'
import StateCommand from '../../state/StateCommand.js'
import HelperCanvas from '../../helper/HelperCanvas.js'
import StyleSheetSelector from '../../state/stylesheet/StyleSheetSelector.js'
import HelperDOM from '../../helper/HelperDOM.js'
import HelperLocalStore from '../../helper/HelperLocalStore.js'
import CanvasCommon from '../canvas/CanvasCommon.js'
import StateSelectedElement from '../../state/StateSelectedElement.js'
import HelperOverride from '../../helper/HelperOverride.js'
import StyleSheetComponent from '../../state/stylesheet/StyleSheetComponent.js'
import HelperElement from '../../helper/HelperElement.js'

export default {
  getElementSectionData () {
    const element = StateSelectedElement.getElement()
    if (element && HelperElement.isCanvasElement(element)) {
      return this.getSectionData(element, true)
    }
  },

  getSectionData (element = null, addOverrides = false) {
    const currentSelector = StyleSheetSelector.getCurrentSelector()
    const style = StateStyleSheet.getCurrentStyleObject(currentSelector)
    const computedStyle = StateSelectedElement.getComputedStyle()
    const data = { currentSelector, style, computedStyle }
    if (element && addOverrides) {
      data.overrides = this.getFullOverrides(element)
    }
    return data
  },

  async changeStyle (properties, panelReload = false, doCommand = 'changeStyle') {
    const selector = StyleSheetSelector.getCurrentSelector()
    const command = this.initStyleCommand(selector, doCommand)
    this.setStyleProperties(command, properties, selector)
    await this.runCommand(command, panelReload)
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

  async runCommand (command, panelReload) {
    if (ExtendJS.isEmpty(command.do.properties)) return
    // we don't want to wait for the stacking to take effect, so no await
    StateCommand.stackCommand(command)
    await StateCommand.executeCommand(command.do, true, panelReload)
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

  injectPropertyFields (form, properties) {
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
  },

  injectResetOverrides (template, overridesExist) {
    const node = template.getElementsByClassName('style-reset-overrides')[0]
    HelperDOM.toggle(node, overridesExist)
  },

  // get the node's full overrides and the style overrides
  getFullOverrides (element) {
    const componentParents = HelperOverride.getParents(element, 'component')
    const elementParents = HelperOverride.getParents(element, 'element')
    return {
      component: this.getComponentFullOverrides(element, componentParents),
      element: this.getElementFullOverrides(element, elementParents)
    }
  },

  getComponentFullOverrides (element, parents) {
    if (!parents || !parents.length) return { exists: false }
    const overrides = HelperOverride.getNodeFullOverrides(element, 'component', parents)
    // selector overrides are needed for the main component only, since sub-components
    // can't have styles, only elements have it
    const selectors = (element === parents[0].element)
      ? StyleSheetComponent.getOverrideSelectors(parents[0].data.ref)
      : []
    const exists = this.checkExists(overrides, selectors)
    return { overrides, selectors, exists }
  },

  getElementFullOverrides (element, parents) {
    if (!parents || !parents.length) return { exists: false }
    const ref = HelperElement.getStyleRef(element)
    const overrides = HelperOverride.getNodeFullOverrides(element, 'element', parents)
    const selectors = StyleSheetComponent.getOverrideSelectors(parents[0].data.ref, ref)
    const exists = this.checkExists(overrides, selectors)
    return { overrides, selectors, exists }
  },

  checkExists (overrides, selectors) {
    return Boolean(!ExtendJS.isEmpty(overrides) || selectors.length)
  },

  getGeneralValues (withNone = true) {
    const array = ['inherit', 'initial', 'revert', 'unset']
    if (withNone) array.unshift('none')
    return array
  },

  isGeneralValue (value, withNone = true) {
    return this.getGeneralValues(withNone).includes(value)
  }
}
