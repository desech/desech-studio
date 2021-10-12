import HelperFile from './HelperFile.js'
import HelperElement from './HelperElement.js'
import HelperProject from './HelperProject.js'

export default {
  isComponent (element) {
    return Boolean(element.dataset.ssComponent)
  },

  getComponentChildren (element) {
    return element.querySelector('.component-children:not(.component-element)')
  },

  getComponentName (element) {
    const file = element.getAttributeNS(null, 'src')
    const name = HelperFile.getBasename(file)
    return name.replace('.html', '')
  },

  getCurrentComponentData () {
    const string = document.getElementById('page').dataset.component
    return string ? JSON.parse(string) : null
  },

  setCurrentComponentData (data) {
    document.getElementById('page').dataset.component = data ? JSON.stringify(data) : ''
  },

  getCurrentComponentHole () {
    const query = ':not([data-ss-component]) [data-ss-component-hole]'
    const element = document.getElementById('canvas').querySelector(query)
    if (element) return HelperElement.getRef(element)
  },

  canAssignComponentHole (element) {
    const type = HelperElement.getType(element)
    return (type === 'block' && HelperFile.isComponentFile(HelperProject.getFile()) &&
      !element.children.length && !element.closest('[data-ss-component]'))
  }
}
