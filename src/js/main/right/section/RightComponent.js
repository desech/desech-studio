import HelperDOM from '../../../helper/HelperDOM.js'
import RightCommon from '../RightCommon.js'
import StateSelectedElement from '../../../state/StateSelectedElement.js'
import HelperComponent from '../../../helper/HelperComponent.js'
import RightHtmlCommon from './html/RightHtmlCommon.js'
import HelperOverride from '../../../helper/HelperOverride.js'
import ExtendJS from '../../../helper/ExtendJS.js'
import StyleSheetComponent from '../../../state/stylesheet/StyleSheetComponent.js'

export default {
  getSection (sectionData) {
    const template = HelperDOM.getTemplate('template-style-component')
    const element = StateSelectedElement.getElement()
    const componentData = HelperComponent.getComponentData(element)
    this.injectData(template, element, sectionData, componentData)
    return template
  },

  injectData (template, element, sectionData, componentData) {
    RightCommon.injectResetOverrides(template, sectionData.overrides.component.exists)
    this.injectComponentRef(template, componentData)
    this.injectComponentName(template, element, componentData)
    this.injectVariants(template, element, componentData)
    this.injectComponentFile(template, componentData)
    RightCommon.injectPropertyFields(template, componentData.properties)
    this.highlightOverides(template, sectionData.overrides.component.overrides)
  },

  injectComponentRef (container, data) {
    const node = container.getElementsByClassName('sidebar-title-text')[0]
    node.dataset.tooltip = data.ref
  },

  injectComponentName (container, element, data) {
    const node = container.getElementsByClassName('sidebar-component-name')[0]
    node.textContent = HelperComponent.getComponentName(data.file)
  },

  injectComponentFile (container, data) {
    const field = container.getElementsByClassName('style-html-source-name')[0]
    RightHtmlCommon.setFileName(field, data.file)
  },

  injectVariants (template, element, data) {
    const container = template.getElementsByClassName('style-variant-section')[0]
    const isComponentElement = HelperComponent.isComponentElement(element)
    this.injectVariantsList(container, data, isComponentElement)
    this.injectVariantsForm(container, data, isComponentElement)
  },

  injectVariantsList (container, data, isComponentElement) {
    if (ExtendJS.isEmpty(data.main?.variants)) return
    const list = container.getElementsByClassName('style-variant-elements')[0]
    HelperDOM.show(list)
    for (const [name, values] of Object.entries(data.main.variants)) {
      this.injectVariantElement(list, name, Object.keys(values), data?.variants,
        isComponentElement)
    }
  },

  injectVariantElement (list, name, values, variants, isComponentElement) {
    const li = HelperDOM.getTemplate('template-style-component-variant')
    const fields = li.children[0].elements
    fields.name.value = fields.name.dataset.tooltip = name
    const selected = variants ? variants[name] : null
    this.injectVariantOptions(li, fields.value, name, values, selected, isComponentElement)
    list.appendChild(li)
  },

  injectVariantOptions (li, select, name, values, selected, isComponentElement) {
    for (const value of values) {
      const option = document.createElement('option')
      select.appendChild(option)
      this.setVariantOption(li, option, name, value, selected, isComponentElement)
    }
  },

  setVariantOption (li, option, name, value, selected, isComponentElement) {
    option.value = option.textContent = value
    if (value !== selected) return
    li.dataset.value = JSON.stringify({ name, value })
    option.setAttributeNS(null, 'selected', '')
    if (isComponentElement) return
    const buttons = option.closest('li').getElementsByTagName('button')
    HelperDOM.show(buttons)
  },

  injectVariantsForm (container, data, isComponentElement) {
    if (isComponentElement || !this.hasOverrides(data)) return
    const form = container.getElementsByClassName('style-variant-form-container')[0]
    HelperDOM.show(form)
    this.injectVariantsDatalist(container, data)
  },

  hasOverrides (data) {
    return !ExtendJS.isEmpty(data?.overrides) || StyleSheetComponent.hasOverrides(data.ref)
  },

  injectVariantsDatalist (container, data) {
    if (ExtendJS.isEmpty(data.main?.variants)) return
    const datalist = container.getElementsByClassName('style-variant-list-names')[0]
    for (const name of Object.keys(data.main.variants)) {
      const option = document.createElement('option')
      option.value = option.textContent = name
      datalist.appendChild(option)
    }
  },

  highlightOverides (template, overrides) {
    HelperOverride.highlightOveride(template, overrides?.component, 'swap-component-button')
    HelperOverride.highlightOverideVariants(template, overrides?.variants)
    HelperOverride.highlightOverideProperties(template, overrides?.properties)
    HelperOverride.highlightOverideWarning(template, overrides)
  }
}
