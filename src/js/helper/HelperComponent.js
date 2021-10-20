import HelperFile from './HelperFile.js'
import HelperElement from './HelperElement.js'
import HelperProject from './HelperProject.js'

export default {
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

  getInstanceData (element) {
    const data = element.dataset.ssComponent
    return data ? JSON.parse(data) : null
  },

  getInstanceFile (element) {
    const data = this.getInstanceData(element)
    return data ? data.file : null
  },

  getInstanceName (element = null, file = null, folder = null) {
    if (!file) file = this.getInstanceFile(element)
    const name = HelperFile.getRelPath(file, HelperFile.getAbsPath('component', folder))
    return name.replace('.html', '')
  },

  getInstanceProperties (element) {
    const data = this.getInstanceData(element)
    return data ? data.properties : null
  },

  setInstanceData (element, data) {
    element.dataset.ssComponent = data ? JSON.stringify(data) : ''
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
    return (type === 'block' && HelperProject.isFileComponent() &&
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

  getMovableElement (node) {
    node = node.closest('.element:not(.component-element)')
    // if this is not the main component hole, then jump directly to the component,
    // because holes are not movable
    if (node && this.isComponentHole(node) && (HelperProject.isFilePage() ||
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
      (HelperProject.isFileComponent() && HelperElement.getRef(node) === this.getMainHole()))
  }
}
