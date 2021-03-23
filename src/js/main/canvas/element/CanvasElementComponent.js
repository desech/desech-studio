import CanvasElementCreate from './CanvasElementCreate.js'
import CanvasElementManage from './CanvasElementManage.js'
import HelperElement from '../../../helper/HelperElement.js'
import CanvasElement from '../CanvasElement.js'
import HelperTrigger from '../../../helper/HelperTrigger.js'
import HelperEvent from '../../../helper/HelperEvent.js'
import Page from '../../../page/Page.js'
import HelperCanvas from '../../../helper/HelperCanvas.js'

export default {
  getEvents () {
    return {
      dblclick: ['dblclickLoadComponentEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  async dblclickLoadComponentEvent (event) {
    if (HelperCanvas.getOperation() !== 'editing' &&
      event.target.closest('.element.component')) {
      await this.loadComponent(event.target.closest('.element.component'))
    }
  },

  async loadComponent (element) {
    await Page.loadMain(element.getAttributeNS(null, 'src'))
  },

  async createElement (file) {
    const element = await this.addComponentElement(file)
    const ref = HelperElement.getRef(element)
    CanvasElement.addRemoveElementCommand(ref, 'addElement', 'removeElement', false)
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'element' })
  },

  async addComponentElement (file) {
    const element = CanvasElementCreate.getElementTemplate('component')
    await this.buildComponentElement(element, file)
    CanvasElementManage.addPastedElementPlacement()
    CanvasElementManage.createPastedElement(element)
    return element
  },

  async buildComponentElement (element, file) {
    element.setAttributeNS(null, 'src', file)
    const html = await window.electron.invoke('rendererParseComponentFile', file)
    this.addHtml(element, html)
  },

  addHtml (element, html) {
    element.insertAdjacentHTML('afterbegin', html.canvas)
    if (html.datalist) {
      document.getElementById('datalist').insertAdjacentHTML('beforeend', html.datalist)
    }
  },

  processComponents (callback) {
    const list = document.querySelectorAll('.component[data-all-properties]')
    for (let i = list.length - 1; i >= 0; i--) {
      callback(list[i])
    }
  },

  renderComponents () {
    this.processComponents(element => this.renderComponent(element))
  },

  renderComponent (element) {
    if (!element.dataset.allProperties || !element.innerHTML) return
    const properties = this.getAllProperties(element.dataset.allProperties)
    const html = element.innerHTML
    element.dataset.unrenderedHtml = html
    element.innerHTML = html.replace(/{{(.*?)}}/g, (match, name) => properties[name] || match)
  },

  getAllProperties (properties) {
    const all = {}
    for (const list of JSON.parse(properties)) {
      for (const [key, val] of Object.entries(list)) {
        all[key] = val
      }
    }
    return all
  },

  unrenderComponents () {
    this.processComponents(element => this.unrenderComponent(element))
  },

  unrenderComponent (element) {
    if (!element.dataset.unrenderedHtml) return
    element.innerHTML = element.dataset.unrenderedHtml
    delete element.dataset.unrenderedHtml
  },

  insertComponentChildren () {
    CanvasElementManage.addPastedElementPlacement('inside')
    CanvasElementCreate.createElement('component-children')
  }
}
