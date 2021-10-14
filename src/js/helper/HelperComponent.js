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

  getComponentChildren (element) {
    // the other component holes will also be component-element, so it's safe to fetch the one
    // that is not also a component-element, because it's the only one
    return element.querySelector('[data-ss-component-hole]:not(.component-element)')
  },

  getComponentInstanceData (element) {
    const data = element.dataset.ssComponent
    return data ? JSON.parse(data) : null
  },

  getComponentInstanceFile (element) {
    const data = this.getComponentInstanceData(element)
    return data ? data.file : null
  },

  getComponentInstanceName (element = null, file = null) {
    if (!file) file = this.getComponentInstanceFile(element)
    const name = HelperFile.getRelPath(file, HelperFile.getAbsPath('component'))
    return name.replace('.html', '')
  },

  getComponentMainData () {
    const string = document.getElementById('page').dataset.component
    return string ? JSON.parse(string) : null
  },

  setComponentMainData (data) {
    document.getElementById('page').dataset.component = data ? JSON.stringify(data) : ''
  },

  getComponentMainHole () {
    const query = ':not([data-ss-component]) [data-ss-component-hole]'
    const elements = document.getElementById('canvas').querySelectorAll(query)
    for (const element of elements) {
      if (HelperElement.isCanvasElement(element)) {
        return HelperElement.getRef(element)
      }
    }
  },

  canAssignComponentHole (element) {
    const type = HelperElement.getType(element)
    return (type === 'block' && HelperProject.isFileComponent() && !element.children.length &&
      !element.closest('[data-ss-component]'))
  }
}
