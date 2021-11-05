import HelperComponent from './HelperComponent.js'
import HelperElement from './HelperElement.js'
import HelperDOM from './HelperDOM.js'
import ExtendJS from './ExtendJS.js'
import HelperStyle from './HelperStyle.js'

export default {
  getParents (element, type) {
    if (type === 'element' && HelperComponent.belongsToAComponent(element)) {
      return this.getElementParents(element)
    } else if (type === 'component' && HelperComponent.isComponentElement(element)) {
      return this.getComponentParents(element.parentNode)
    }
  },

  getElementParents (element, structure = []) {
    if (HelperComponent.isComponent(element)) {
      // the component root element
      this.addElementToStructure(element, structure)
      return this.getComponentParents(element.parentNode, structure)
    } else if (HelperComponent.isComponentHole(element)) {
      // the component hole element
      const component = element.closest('[data-ss-component]')
      if (!component) return structure
      this.addElementToStructure(component, structure)
      return this.getComponentParents(component.parentNode, structure)
    } else if (HelperComponent.isComponentElement(element)) {
      // a regular component element
      return this.getComponentParents(element, structure)
    }
  },

  addElementToStructure (element, structure) {
    const data = HelperComponent.getComponentData(element)
    structure.unshift({ element, data })
  },

  getComponentParents (element, structure = []) {
    if (!element) return structure
    const node = element.closest('[data-ss-component], [data-ss-component-hole]')
    if (!node) return structure
    if (HelperComponent.isComponentHole(node)) {
      // when we find a hole, we need to skip its component
      const parent = node.closest('[data-ss-component]')?.parentNode
      this.getComponentParents(parent, structure)
    } else { // component
      this.addElementToStructure(node, structure)
      if (HelperComponent.isComponentElement(node)) {
        this.getComponentParents(node.parentNode, structure)
      }
    }
    return structure
  },

  getOverrides (element, type) {
    const parents = this.getParents(element, type)
    if (!parents?.length) return
    const ref = this.getOverrideRef(element, type)
    return this.getOverrideData(parents, ref)
  },

  getOverrideRef (element, type) {
    return (type === 'element')
      ? HelperElement.getStyleRef(element)
      : HelperComponent.getInstanceRef(element)
  },

  getOverrideData (parents, ref) {
    let data = this.getInitialData(parents[0].data)
    for (let i = 1; i < parents.length; i++) {
      data = this.getOverrideDataParent(data, parents[i].data.ref)
    }
    if (!data[ref]) data[ref] = {}
    return data[ref]
  },

  getInitialData (data) {
    if (!data.overrides) data.overrides = {}
    return data.overrides
  },

  getOverrideDataParent (data, ref) {
    if (!data[ref]) data[ref] = {}
    if (!data[ref].children) data[ref].children = {}
    return data[ref].children
  },

  highlightOveride (template, check, cls) {
    if (!check) return
    for (const node of template.getElementsByClassName(cls)) {
      node.classList.add('override')
    }
  },

  highlightOverideAttributes (template, attributes) {
    if (!attributes) return
    const fields = this.getAttributeFields(template)
    for (const field of fields) {
      if (field.name in attributes) {
        field.classList.add('override')
      }
    }
  },

  getAttributeFields (template) {
    const detailsForm = template.getElementsByClassName('style-html-details')[0]
    const detailFields = detailsForm?.elements || []
    return [...template.elements, ...detailFields]
  },

  highlightOverideCustomAttributes (template, attributes) {
    if (!attributes) return
    const forms = template.getElementsByClassName('style-html-element-form')
    for (const form of forms) {
      if (form.elements.name.value in attributes) {
        form.elements.name.classList.add('override')
        form.elements.value.classList.add('override')
      }
    }
  },

  highlightOverideProperties (template, properties) {
    if (!properties) return
    const blocks = template.getElementsByClassName('style-component-property')
    for (const block of blocks) {
      const fields = block.getElementsByClassName('style-component-property-field')
      if (fields[0].value in properties) {
        fields[0].classList.add('override')
        fields[1].classList.add('override')
      }
    }
  },

  highlightOverideClasses (template, classes) {
    if (!classes) return
    const selectors = template.getElementsByClassName('selector-element')
    for (const li of selectors) {
      this.highlightOverideClass(li, classes)
    }
  },

  highlightOverideClass (li, classes) {
    const selectorClass = HelperStyle.getClassFromSelector(li.dataset.selector)
    const cls = HelperStyle.getViewableClass(selectorClass)
    if (classes[cls]) {
      li.getElementsByClassName('selector-title')[0].classList.add('override')
    }
  },

  highlightOverideClassesWarning (template, classes) {
    const warning = template.getElementsByClassName('style-override-warning')[0]
    const deletedClasses = this.getDeletedRecords(classes)
    if (deletedClasses) {
      HelperDOM.show(warning)
      this.injectTooltipRecords(warning, 'classes', deletedClasses)
    }
  },

  highlightOverideWarning (template, overrides, elementType = null) {
    const nodes = template.getElementsByClassName('style-override-warning')
    const deletedAttrs = this.getDeletedAttributes(template, overrides?.attributes)
    const deletedProps = this.getDeletedRecords(overrides?.properties)
    for (const node of nodes) {
      if ((node.dataset.type === 'text' && elementType === 'text' && overrides?.inner) ||
        (node.dataset.type === 'attributes' && deletedAttrs) ||
        (node.dataset.type === 'properties' && deletedProps)) {
        this.highlightOverideWarningNode(node, deletedAttrs, deletedProps)
      }
    }
  },

  highlightOverideWarningNode (node, deletedAttrs, deletedProps) {
    HelperDOM.show(node)
    if (node.dataset.type === 'attributes') {
      this.injectTooltipRecords(node, 'attributes', deletedAttrs)
    } else if (node.dataset.type === 'properties') {
      this.injectTooltipRecords(node, 'properties', deletedProps)
    }
  },

  getDeletedAttributes (template, attributes) {
    const deleted = this.getDeletedRecords(attributes)
    if (!deleted) return
    const regular = this.getRegularAttributes(template)
    // remove the detail fields; we only care about the custom attributes
    for (let i = deleted.length - 1; i >= 0; i--) {
      if (regular.includes(deleted[i])) {
        deleted.splice(i, 1)
      }
    }
    return deleted.length ? deleted : null
  },

  getRegularAttributes (template) {
    const fields = this.getAttributeFields(template)
    const names = fields.map(field => field.name)
    return ExtendJS.unique(names)
  },

  getDeletedRecords (obj) {
    if (!obj) return null
    const records = []
    for (const [name, val] of Object.entries(obj)) {
      if (val.delete) records.push(name)
    }
    return (records.length) ? records : null
  },

  injectTooltipRecords (node, type, records) {
    if (node.dataset.type === type) {
      if (records) {
        node.dataset.tooltip += ' ' + records.join(', ')
      } else {
        delete node.dataset.tooltip
      }
    }
  }
}
