import HelperDOM from '../../../helper/HelperDOM.js'
import RightCommon from '../RightCommon.js'
import StateSelectedElement from '../../../state/StateSelectedElement.js'
import HelperComponent from '../../../helper/HelperComponent.js'
import RightHtmlCommon from './html/RightHtmlCommon.js'
import HelperOverride from '../../../helper/HelperOverride.js'
import ExtendJS from '../../../helper/ExtendJS.js'

export default {
  getSection () {
    const template = HelperDOM.getTemplate('template-style-component')
    const element = StateSelectedElement.getElement()
    const data = HelperComponent.getComponentData(element)
    this.injectData(template, element, data)
    return template
  },

  injectData (template, element, data) {
    const overrides = HelperOverride.getOverrides(element, 'component')
    RightCommon.injectResetOverrides(template, overrides)
    this.injectComponentRef(template, data)
    this.injectComponentName(template, element, data)
    this.injectVariants(template, element, data)
    this.injectComponentFile(template, data)
    RightCommon.injectPropertyFields(template, data.properties)
    this.highlightOverides(template, overrides)
  },

  injectComponentRef (container, data) {
    const node = container.getElementsByClassName('sidebar-title-text')[0]
    node.dataset.tooltip = data.ref
  },

  injectComponentName (container, element, data) {
    const node = container.getElementsByClassName('sidebar-component-name')[0]
    node.textContent = HelperComponent.getInstanceName(element, data.file)
  },

  injectComponentFile (container, data) {
    const field = container.getElementsByClassName('style-html-source-name')[0]
    RightHtmlCommon.setFileName(field, data.file)
  },

  injectVariants (template, element, data) {
    if (HelperComponent.isComponentElement(element)) return
    const container = template.getElementsByClassName('style-variant-section')[0]
    HelperDOM.show(container)
    this.injectVariantsList(container, data)
    this.injectVariantsForm(container, data)
  },

  injectVariantsList (container, data) {
    if (ExtendJS.isEmpty(data.main?.variants)) return
    const list = container.getElementsByClassName('style-variant-elements')[0]
    for (const [name, values] of Object.entries(data.main.variants)) {
      this.injectVariantElement(list, name, Object.keys(values), data?.variants)
    }
  },

  injectVariantElement (list, name, values, variants) {
    const li = HelperDOM.getTemplate('template-style-component-variant')
    const fields = li.children[0].elements
    fields.name.value = name
    this.injectVariantOptions(li, fields.value, name, values, variants ? variants[name] : null)
    list.appendChild(li)
  },

  injectVariantOptions (li, select, name, values, selected) {
    for (const value of values) {
      const option = document.createElement('option')
      select.appendChild(option)
      this.setVariantOption(li, option, name, value, selected)
    }
  },

  setVariantOption (li, option, name, value, selected) {
    option.value = option.textContent = value
    if (value !== selected) return
    li.dataset.value = JSON.stringify({ name, value })
    option.setAttributeNS(null, 'selected', '')
    const buttons = option.closest('li').getElementsByTagName('button')
    HelperDOM.show(buttons)
  },

  injectVariantsForm (container, data) {
    if (ExtendJS.isEmpty(data?.overrides)) return
    const node = container.getElementsByClassName('style-variant-form-container')[0]
    HelperDOM.show(node)
    this.injectVariantsDatalist(container, data)
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
    HelperOverride.highlightOverideProperties(template, overrides?.properties)
    HelperOverride.highlightOverideWarning(template, overrides)
  }
}
