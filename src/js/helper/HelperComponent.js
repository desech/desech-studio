import HelperFile from './HelperFile.js'
import HelperElement from './HelperElement.js'
import ExtendJS from './ExtendJS.js'

export default {
  // also check the material design repo -> Build.sanitizeClass()
  sanitizeComponent (name) {
    // only allow alphanumeric and dashes
    return name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
  },

  getEmptyComponent () {
    const ref = HelperElement.generateElementRef()
    return `<div class="block ${ref}"></div>`
  },

  isComponent (element) {
    return element.hasAttributeNS(null, 'data-ss-component')
  },

  isComponentHole (element) {
    return element.hasAttributeNS(null, 'data-ss-component-hole')
  },

  isComponentElement (element) {
    return element.classList.contains('component-element')
  },

  belongsToAComponent (element) {
    return this.isComponent(element) || this.isComponentHole(element) ||
      this.isComponentElement(element)
  },

  getComponentData (node) {
    const data = node.dataset.ssComponent
    return data ? JSON.parse(data) : null
  },

  // set instance and main component data
  setComponentData (node, data) {
    if (!ExtendJS.isEmpty(data)) {
      this.removeMissingInstanceVariants(node, data)
      ExtendJS.clearEmptyObjects(data)
      node.setAttributeNS(null, 'data-ss-component', JSON.stringify(data))
    } else {
      // this is needed when we set the main data to our root element, not on the instance
      node.removeAttributeNS(null, 'data-ss-component')
    }
  },

  removeMissingInstanceVariants (node, data) {
    if (!data?.variants) return
    const allData = this.getComponentData(node)
    if (!allData?.main?.variants) return
    for (const [name, value] of Object.entries(data.variants)) {
      if (!allData.main.variants[name] && !data.main.variants[name]) {
        delete data.variants[name]
      } else if (allData.main.variants[name] && !allData.main.variants[name][value] &&
        data.main.variants[name] && !data.main.variants[name][value]) {
        delete data.variants[name][value]
      }
    }
  },

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
    const name = HelperFile.getRelPath(file, HelperFile.getAbsPath('component', folder))
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

  isMovableElement (node) {
    // not movable are component elements and holes that are not also components
    // or non main holes
    return !this.isComponentElement(node) &&
      (!this.isComponentHole(node) || this.isComponent(node) ||
      (HelperFile.isComponentFile() && HelperElement.getRef(node) === this.getMainHole()))
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
    if (!variants) return ''
    return Object.entries(variants).reduce((array, variant) => {
      return [...array, variant.join('=')]
    }, []).join(' ')
  }
}
