import HelperComponent from './HelperComponent.js'
import HelperElement from './HelperElement.js'
import HelperDOM from './HelperDOM.js'
import ExtendJS from './ExtendJS.js'
import HelperStyle from './HelperStyle.js'

export default {
  getMainParent (element, type) {
    const parents = this.getParents(element, type)
    if (parents) return parents[0]
  },

  getParents (element, type) {
    if (type === 'element' && HelperComponent.belongsToAComponent(element)) {
      return this.getElementParents(element)
    } else if (type === 'component' && HelperComponent.isComponentElement(element)) {
      return this.getComponentParents(element.parentNode)
    } else if (type === 'component' && HelperComponent.isComponent(element)) {
      // top level components, don't have any parents, but we should be able to reset them
      const data = HelperComponent.getComponentData(element)
      return [{ element, data, topLevel: true }]
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

  // get a node's full overrides, used to highlight the overrides in the UI
  // full overrides means that the variant data is also added to the overrides
  getNodeFullOverrides (element, type, parents) {
    if (!parents?.length) return
    const ref = this.getOverrideRef(element, type)
    const data = this.getComponentFullOverrides(parents)
    return this.processParentData(data, parents, ref)
  },

  getOverrideRef (element, type) {
    return (type === 'element')
      ? HelperElement.getStyleRef(element)
      : HelperElement.getComponentRef(element)
  },

  // get a node's simple overrides, used to create new overrides
  // this will give you the override data needed for the component to be saved
  // this will not include the full data coming from variants
  // the returned object is the direct object which will be later mutated
  getNodeSimpleOverrides (parents, ref) {
    if (!parents[0].data.overrides) parents[0].data.overrides = {}
    return this.processParentData(parents[0].data.overrides, parents, ref)
  },

  processParentData (data, parents, ref) {
    for (let i = 1; i < parents.length; i++) {
      data = this.getOverrideDataParent(data, parents[i].data.ref)
    }
    return this.returnOverrideData(parents, data, ref)
  },

  getOverrideDataParent (data, ref) {
    if (!data[ref]) data[ref] = {}
    if (!data[ref].children) data[ref].children = {}
    return data[ref].children
  },

  returnOverrideData (parents, data, ref) {
    // usually we get data from our ref index, but when we are at the top, we check for any data
    if (parents[0].topLevel) {
      return !ExtendJS.isEmpty(data) ? { children: data } : {}
    } else {
      if (!data[ref]) data[ref] = {}
      return data[ref]
    }
  },

  // get a component's full overrides, used in parsing
  // this gives you the regular overrides + the ones coming from the top variants,
  //    not the overridden variants too
  getTopComponentFullOverrides (data) {
    const overrides = {}
    this.mergeVariants(data, overrides)
    this.mergeOverrides(data, overrides)
    return overrides
  },

  // get a component's full overrides, including all overridden variants too
  // used by getNodeFullOverrides() when building the highlighted overrides
  getComponentFullOverrides (parents) {
    const overrides = {}
    this.mergeVariants(parents[0].data, overrides)
    this.mergeOverriddenVariants(parents[0].data?.overrides, overrides, parents)
    this.mergeOverrides(parents[0].data, overrides)
    ExtendJS.clearEmptyObjects(overrides)
    return overrides
  },

  mergeOverriddenVariants (parentOverrides, overrides, parents) {
    if (!parentOverrides) return
    for (const [ref, record] of Object.entries(parentOverrides)) {
      if (!overrides[ref]) overrides[ref] = {}
      if (record.children) {
        if (!overrides[ref].children) overrides[ref].children = {}
        this.mergeOverriddenVariants(record.children, overrides[ref].children, parents)
      }
      if (record.variants) {
        record.main = this.getParentMainData(parents, ref)
        this.mergeVariants(record, overrides[ref].children)
      }
    }
  },

  getParentMainData (parents, ref) {
    for (const parent of parents) {
      if (parent.data.ref === ref) return parent.data.main
    }
    return null
  },

  mergeVariants (data, overrides) {
    if (!data?.variants) return
    for (const [name, value] of Object.entries(data.variants)) {
      // when we delete variants, we don't cleanup because of undo
      // this means we can have missing variants
      if (data?.main?.variants[name] && data?.main?.variants[name][value]) {
        this.mergeObjects(overrides, data?.main?.variants[name][value])
      }
    }
  },

  mergeOverrides (data, overrides) {
    if (data?.fullOverrides) {
      this.mergeObjects(overrides, data.fullOverrides)
    } else if (data?.overrides) {
      this.mergeObjects(overrides, data.overrides)
    }
  },

  // obj1 is mutated; obj2 is placed on top of obj1
  mergeObjects (obj1, obj2) {
    ExtendJS.mergeDeep(obj1, obj2)
    this.mergeObjectsFix(obj1)
  },

  mergeObjectsFix (obj) {
    // mergeDeep will merge everything including the attribute/property/class values
    // if we have these pairs value/delete or add/delete, remove the first value
    if (ExtendJS.isEmpty(obj)) return
    if (Object.keys(obj).length === 2 && (('value' in obj && 'delete' in obj) ||
      ('add' in obj && 'delete' in obj))) {
      delete obj[Object.keys(obj)[0]]
    }
    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        this.mergeObjectsFix(obj[key])
      }
    }
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
    const selectorClass = HelperStyle.extractClassSelector(li.dataset.selector)
    const cls = HelperStyle.getViewableClass(selectorClass)
    if (classes[cls]) {
      li.classList.add('override')
    }
  },

  highlightOverrideSelectors (template, selectorOverrides) {
    if (!selectorOverrides) return
    const records = template.getElementsByClassName('selector-element')
    for (const li of records) {
      this.highlightOverideSelector(li, selectorOverrides)
    }
  },

  highlightOverideSelector (li, selectors) {
    if (selectors.includes(li.dataset.selector)) {
      li.classList.add('override')
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
  },

  highlightOverideVariants (template, variants) {
    if (!variants) return
    const blocks = template.getElementsByClassName('style-variant-element-li')
    for (const block of blocks) {
      const fields = block.getElementsByClassName('style-variant-element-form')[0].elements
      if (fields[0].value in variants) {
        fields[0].classList.add('override')
        fields[1].classList.add('override')
      }
    }
  }
}
