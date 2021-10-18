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

  getComponentInstanceData (element) {
    const data = element.dataset.ssComponent
    return data ? JSON.parse(data) : null
  },

  getComponentInstanceFile (element) {
    const data = this.getComponentInstanceData(element)
    return data ? data.file : null
  },

  getComponentInstanceName (element = null, file = null, folder = null) {
    if (!file) file = this.getComponentInstanceFile(element)
    const name = HelperFile.getRelPath(file, HelperFile.getAbsPath('component', folder))
    return name.replace('.html', '')
  },

  getComponentMainData () {
    const string = document.getElementById('page').dataset.component
    return string ? JSON.parse(string) : null
  },

  setComponentMainData (data) {
    document.getElementById('page').dataset.component = data ? JSON.stringify(data) : ''
  },

  canAssignComponentHole (element) {
    const type = HelperElement.getType(element)
    return (type === 'block' && HelperProject.isFileComponent() && !element.children.length &&
      !element.closest('[data-ss-component]'))
  },

  getComponentMainHole () {
    const query = '[data-ss-component-hole]:not(.component-element)'
    const elements = document.getElementById('canvas').querySelectorAll(query)
    for (const element of elements) {
      if (!element.closest('[data-ss-component]') && HelperElement.isCanvasElement(element)) {
        return HelperElement.getRef(element)
      }
    }
  },

  getComponentInstanceHole (root) {
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
      HelperElement.getRef(node) !== this.getComponentMainHole())) {
      node = node.closest('[data-ss-component]')
    }
    return node
  }
}
