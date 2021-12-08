import HelperDOM from '../../helper/HelperDOM.js'
import StateStyleSheet from '../StateStyleSheet.js'
import HelperLocalStore from '../../helper/HelperLocalStore.js'
import HelperElement from '../../helper/HelperElement.js'
import StyleSheetCommon from '../stylesheet/StyleSheetCommon.js'
import StyleSheetSelector from '../stylesheet/StyleSheetSelector.js'
import StateCommandCommon from './StateCommandCommon.js'
import HelperTrigger from '../../helper/HelperTrigger.js'
import ProjectResponsive from '../../start/project/ProjectResponsive.js'
import HelperProject from '../../helper/HelperProject.js'
import HelperCanvas from '../../helper/HelperCanvas.js'
import HelperComponent from '../../helper/HelperComponent.js'
import StateCommandOverride from './StateCommandOverride.js'
import StateCommandVariant from './StateCommandVariant.js'

export default {
  addElement (data) {
    const element = HelperElement.getElement(data.ref)
    if (!element) return
    HelperDOM.show(element)
  },

  removeElement (data) {
    const element = HelperElement.getElement(data.ref)
    if (!element) return
    element.removeAttributeNS(null, 'data-ss-hidden')
    HelperDOM.hide(element)
  },

  moveElement (data) {
    const canvas = HelperCanvas.getCanvas()
    const elements = canvas.querySelectorAll(`[data-ss-token~="${data.token}"]`)
    for (const element of elements) {
      if (element.hasAttributeNS(null, 'hidden') &&
        !element.hasAttributeNS(null, 'data-ss-hidden')) {
        HelperDOM.show(element)
      } else {
        HelperDOM.hide(element)
        element.removeAttributeNS(null, 'data-ss-hidden')
      }
    }
  },

  pasteElement (data) {
    this.addElement(data)
  },

  duplicateElement (data) {
    this.pasteElement(data)
  },

  cutElement (data) {
    this.moveElement(data)
  },

  pasteCutElement (data) {
    this.moveElement(data)
  },

  changeStyle (data) {
    StyleSheetCommon.addRemoveStyleRules(data)
  },

  cutStyle (data) {
    this.changeStyle(data)
  },

  pasteStyle (data) {
    this.changeStyle(data)
  },

  // when pasting cross projects, the image/media file urls and component files will fail
  // @todo find a way to copy these files too if they don't exist,
  // and also integrate the missing components
  pasteElementData (data) {
    const element = HelperElement.getElement(data.ref)
    if (!element) return
    StateCommandCommon.pasteAttributes(element, data.data.attributes)
    StateCommandCommon.pasteStyle(element, data.ref, data.data.style)
  },

  addColor (data) {
    StyleSheetCommon.addRemoveStyleRules({
      selector: ':root',
      properties: {
        [data.name]: data.value
      }
    })
  },

  removeColor (data) {
    StateStyleSheet.removeStyleRule({
      selector: ':root',
      property: data.name
    })
  },

  addResponsive (data) {
    ProjectResponsive.insertResponsive(data.responsive)
    HelperTrigger.triggerReload('responsive-mode-list')
  },

  removeResponsive (data) {
    ProjectResponsive.deleteResponsive(data.responsive)
    HelperTrigger.triggerReload('responsive-mode-list')
  },

  changeResponsive (data) {
    ProjectResponsive.editResponsive(data.current, data.previous)
    HelperTrigger.triggerReload('responsive-mode-list')
  },

  changeMeta (data) {
    HelperProject.setFileMeta(data.meta)
  },

  sortSelector (data) {
    StateStyleSheet.insertSheetAtPosition(data.selector, data.position, data.target)
    HelperDOM.reflow()
  },

  async addSelector (data) {
    const style = StyleSheetSelector.getDeletedSelector(data.previous || data.selector)
    const properties = style && style.length ? style : [{}]
    StateStyleSheet.addSelector(data.selector, properties)
    await StateCommandCommon.addSelectorLinkClass(data.selector)
  },

  async removeSelector (data) {
    StateStyleSheet.saveDeletedSelector(data.selector)
    StyleSheetSelector.deleteSelector(data.selector)
    if (data.ref) {
      await StyleSheetSelector.unlinkDeletedClassSelector(data.selector, data.ref)
    }
  },

  async linkClass (data) {
    await StyleSheetSelector.linkClass(data.cls, data.ref)
  },

  async unlinkClass (data) {
    await StyleSheetSelector.unlinkClass(data.cls, data.ref)
  },

  async changeTag (data) {
    let element = HelperElement.getElement(data.ref)
    if (!element) return
    if (HelperElement.isNormalTag(data.tag)) {
      element = HelperDOM.changeTag(element, data.tag, document)
      element.removeAttributeNS(null, 'data-ss-tag')
    } else {
      element = HelperDOM.changeTag(element, 'div', document)
      element.setAttributeNS(null, 'data-ss-tag', data.tag)
    }
    await StateCommandOverride.overrideElement(element, 'tag', data.tag)
  },

  async changeText (data) {
    const element = HelperElement.getElement(data.ref)
    if (!element) return
    element.innerHTML = HelperLocalStore.getItem(data.textId)
    await StateCommandOverride.overrideElement(element, 'inner', element.innerHTML)
  },

  async setOptions (data) {
    const element = HelperElement.getElement(data.ref)
    if (!element) return
    element.innerHTML = data.html
    await StateCommandOverride.overrideElement(element, 'inner', data.html)
  },

  async setTracks (data) {
    await this.setOptions(data)
  },

  async changeSvg (data) {
    const element = HelperElement.getElement(data.ref)
    if (!element) return
    element.setAttributeNS(null, 'viewBox', data.viewBox)
    const attrs = { viewBox: data.viewBox }
    await StateCommandOverride.overrideElement(element, 'attributes', attrs)
    element.innerHTML = data.inner
    await StateCommandOverride.overrideElement(element, 'inner', data.inner)
  },

  async changeAttribute (data) {
    const element = HelperElement.getElement(data.ref)
    if (!element) return
    for (const [name, value] of Object.entries(data.attributes)) {
      StateCommandCommon.setElementAttribute(element, name, value)
    }
    await StateCommandOverride.overrideElement(element, 'attributes', data.attributes)
  },

  async changeProperties (data) {
    const element = HelperElement.getElement(data.ref)
    if (!element) return
    HelperElement.setProperties(element, data.properties)
    await StateCommandOverride.overrideElement(element, 'properties', data.properties)
  },

  async changeComponentProperties (data) {
    const element = HelperElement.getElement(data.ref)
    if (!element) return
    const componentData = HelperComponent.getComponentData(element)
    HelperComponent.updateComponentData(componentData, 'properties', data.properties)
    HelperComponent.setComponentData(element, componentData)
    await StateCommandOverride.overrideComponent(element, 'component-properties', data.properties)
  },

  async swapComponent (data) {
    const currentElem = HelperElement.getElement(data.currentRef)
    const newElem = HelperElement.getElement(data.newRef)
    if (!currentElem || !newElem) return
    HelperDOM.hide(currentElem)
    HelperDOM.show(newElem)
    const componentData = HelperComponent.getComponentData(newElem)
    await StateCommandOverride.overrideComponent(newElem, 'component', componentData.file)
  },

  assignComponentHole (data) {
    const canvas = document.getElementById('canvas')
    const previous = canvas.getElementsByClassName(data.previous)[0]
    const current = canvas.getElementsByClassName(data.current)[0]
    if (previous) previous.removeAttributeNS(null, 'data-ss-component-hole')
    if (current) current.setAttributeNS(null, 'data-ss-component-hole', '')
  },

  async resetComponentOverrides (data) {
    const element = HelperElement.getElement(data.ref)
    if (!element) return
    await StateCommandVariant.replaceComponent(element, data)
    HelperTrigger.triggerReload('right-panel')
  },

  async resetElementOverrides (data) {
    await this.resetComponentOverrides(data)
  },

  async createVariant (data) {
    const element = HelperElement.getElement(data.ref)
    if (!element) return
    await StateCommandVariant.createVariant(element, data)
  },

  async updateVariant (data) {
    const element = HelperElement.getElement(data.ref)
    if (!element) return
    await StateCommandVariant.updateVariant(element, data)
  },

  async deleteVariant (data) {
    const element = HelperElement.getElement(data.ref)
    if (!element) return
    await StateCommandVariant.deleteVariant(element, data)
  },

  async switchVariant (data) {
    const element = HelperElement.getElement(data.ref)
    if (!element) return
    await StateCommandVariant.switchVariant(element, data.name, data.value)
  },

  async renameVariant (data) {
    const element = HelperElement.getElement(data.ref)
    if (!element) return
    await StateCommandVariant.renameVariant(element, data.values)
  }
}
