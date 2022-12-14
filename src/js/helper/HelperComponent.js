import HelperFile from './HelperFile.js'
import HelperElement from './HelperElement.js'
import ExtendJS from './ExtendJS.js'

export default {
  sanitizeComponent (name) {
    // only allow alphanumeric and dashes
    return name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
  },

  getEmptyComponent () {
    const ref = HelperElement.generateElementRef()
    return `<div class="block ${ref}"></div>`
  },

  isComponent (node) {
    return node.hasAttributeNS(null, 'data-ss-component')
  },

  isComponentHole (node) {
    return node.hasAttributeNS(null, 'data-ss-component-hole')
  },

  isComponentElement (node) {
    return node.classList.contains('component-element')
  },

  belongsToAComponent (node, exceptMainHole = false) {
    return this.isComponent(node) || this.isComponentElement(node) ||
      (this.isComponentHole(node) && (!exceptMainHole || !this.isMainHole(node)))
  },

  // not movable are component elements and holes that are not also components or non main holes
  isMovableElement (node) {
    return !this.isComponentElement(node) &&
      (!this.isComponentHole(node) || this.isComponent(node) || this.isMainHole(node))
  },

  getComponentData (node) {
    const data = node.dataset.ssComponent
    return data ? JSON.parse(data) : null
  },

  // set the instance component data
  setComponentData (node, data) {
    this.cleanPermanentData(data)
    node.setAttributeNS(null, 'data-ss-component', this.getCleanTemporaryData(data))
    // reset the data variant attribute too
    this.setDataVariant(node, data)
  },

  cleanPermanentData (data) {
    this.removeMissingInstanceVariants(data)
    ExtendJS.clearEmptyObjects(data)
  },

  removeMissingInstanceVariants (data) {
    if (!data?.variants) return
    for (const [name, value] of Object.entries(data.variants)) {
      if (!data.main?.variants || !(name in data.main.variants) ||
        !(value in data.main.variants[name])) {
        delete data.variants[name]
      }
    }
  },

  // if we have fullOverrides in our data, then we don't want to delete it permanently because
  // it will still be used by code, but we don't want to save it on the file
  getCleanTemporaryData (data) {
    const cleanData = ExtendJS.cloneData(data)
    if (cleanData.fullOverrides) delete cleanData.fullOverrides
    return JSON.stringify(cleanData)
  },

  // set the component data on the main component
  setMainComponentData (node, mainData) {
    if (!ExtendJS.isEmpty(mainData)) {
      // @todo doesn't work because the node doesn't contain all the subcomponents
      // move this to the open component file code
      // this.removeMissingElementsFromVariants(node, mainData?.variants)
      ExtendJS.clearEmptyObjects(mainData)
      node.setAttributeNS(null, 'data-ss-component', JSON.stringify(mainData))
    } else {
      node.removeAttributeNS(null, 'data-ss-component')
    }
  },

  // removeMissingElementsFromVariants (node, variants) {
  //   if (!variants) return
  //   for (const names of Object.values(variants)) {
  //     for (const obj of Object.values(names)) {
  //       this.removeMissingElements(node, obj)
  //     }
  //   }
  // },

  // removeMissingElements (node, elements) {
  //   for (const [ref, element] of Object.entries(elements)) {
  //     if (!node.getElementsByClassName(ref).length) {
  //       delete elements[ref]
  //     } else if (element.children) {
  //       this.removeMissingElements(node, element.children)
  //     }
  //   }
  // },

  updateComponentData (data, name, value) {
    if (ExtendJS.isEmpty(value)) {
      delete data[name]
    } else {
      data[name] = value
    }
  },

  getInstanceFile (element) {
    const data = this.getComponentData(element)
    return data ? data.file : null
  },

  getComponentName (file, folder = null) {
    const cmpFolder = HelperFile.getAbsPath('component', folder)
    const name = HelperFile.getRelPath(file, cmpFolder)
    return name.replace('.html', '')
  },

  getComponentClass (file, folder = null) {
    const name = this.getComponentName(file, folder)
    return 'cmp-' + name.replaceAll('/', '-')
  },

  getComponentClassSelector (file, variantName, variantValue) {
    const cls = this.getComponentClass(file)
    return `.${cls}[data-variant~="${variantName}=${variantValue}"]`
  },

  getInstanceProperties (element) {
    const data = this.getComponentData(element)
    return data ? data.properties : null
  },

  getInstanceVariants (element) {
    const data = this.getComponentData(element)
    return data ? data.variants : null
  },

  getMainData () {
    const string = document.getElementById('page').dataset.component
    return string ? JSON.parse(string) : null
  },

  setMainData (data) {
    document.getElementById('page').dataset.component = data ? JSON.stringify(data) : ''
  },

  canAssignComponentHole (element) {
    const type = HelperElement.getType(element)
    return (type === 'block' && HelperFile.isComponentFile() &&
      this.hasCanvasChildren(element) && !element.closest('[data-ss-component]'))
  },

  hasCanvasChildren (element) {
    for (const node of element.children) {
      if (HelperElement.isCanvasElement(node)) return false
    }
    return true
  },

  isMainHole (node) {
    return HelperFile.isComponentFile() && HelperElement.getRef(node) === this.getMainHole()
  },

  getMainHole () {
    const query = '[data-ss-component-hole]:not(.component-element)'
    const elements = document.getElementById('canvas').querySelectorAll(query)
    for (const element of elements) {
      if (!element.closest('[data-ss-component]') && HelperElement.isCanvasElement(element)) {
        return HelperElement.getRef(element)
      }
    }
  },

  getInstanceHole (root) {
    // the component root element can also be the component hole
    if (this.isComponentHole(root) && !this.isComponentElement(root)) {
      return root
    }
    // even if there are more holes, the first hole will be our component hole,
    // so it's safe to fetch the first hole we find which is not a component-element
    return root.querySelector('[data-ss-component-hole]:not(.component-element)')
  },

  getInstanceChildren (element) {
    const hole = this.getInstanceHole(element)
    if (hole && hole.children.length) return hole.innerHTML
  },

  setInstanceChildren (element, children) {
    const hole = this.getInstanceHole(element)
    hole.innerHTML = children
  },

  getMovableElement (node) {
    node = node.closest('.element:not(.component-element)')
    // if this is not the main component hole, then jump directly to the component,
    // because holes are not movable
    if (node && this.isComponentHole(node) && (HelperFile.isPageFile() ||
      HelperElement.getRef(node) !== this.getMainHole())) {
      node = node.closest('[data-ss-component]')
    }
    return node
  },

  async fetchComponent (data) {
    const render = await window.electron.invoke('rendererParseComponentFile', data)
    const element = document.createRange().createContextualFragment(render.canvas).children[0]
    this.setComponentData(element, {
      file: data.file,
      ref: data.ref,
      main: render.component.main,
      overrides: render.component?.overrides || null,
      variants: render.component?.variants || null
    })
    return element
  },

  setDataVariant (element, data = null) {
    if (!data) data = this.getComponentData(element)
    const value = this.buildDataVariant(data?.variants)
    // we always need the attribute for the selectors
    element.setAttributeNS(null, 'data-variant', value)
  },

  buildDataVariant (variants) {
    // data-variant="foo-var=bar-val foo2=bar2 foo3=bar3"
    // if the value is empty, it will skip the variant
    // if no variants are set or the component has no variants, then it will show an empty space
    if (!variants) return ' '
    const list = []
    for (const [name, val] of Object.entries(variants)) {
      if (val) list.push(`${name}=${val}`)
    }
    return list.length ? list.join(' ') : ' '
  }
}
