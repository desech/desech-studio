import HelperDOM from '../../helper/HelperDOM.js'
import StateStyleSheet from '../StateStyleSheet.js'
import HelperLocalStore from '../../helper/HelperLocalStore.js'
import HelperElement from '../../helper/HelperElement.js'
import StyleSheetCommon from '../stylesheet/StyleSheetCommon.js'
import StyleSheetSelector from '../stylesheet/StyleSheetSelector.js'
import StateCommandCommon from './StateCommandCommon.js'
import HelperTrigger from '../../helper/HelperTrigger.js'
import ProjectResponsive from '../../start/project/ProjectResponsive.js'
import ExtendJS from '../../helper/ExtendJS.js'
import HelperProject from '../../helper/HelperProject.js'
import HelperCanvas from '../../helper/HelperCanvas.js'
import HelperComponent from '../../helper/HelperComponent.js'
import StateCommandComponent from './StateCommandComponent.js'

export default {
  addElement (data) {
    const element = HelperElement.getElement(data.ref)
    HelperDOM.show(element)
  },

  removeElement (data) {
    const element = HelperElement.getElement(data.ref)
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
    StyleSheetCommon.addRemoveStyleRules(data, true)
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
    StateCommandCommon.pasteAttributes(element, data.data.attributes)
    StateCommandCommon.pasteStyle(element, data.ref, data.data.style)
  },

  addSelector (data) {
    const style = StyleSheetSelector.getDeletedSelector(data.previous || data.selector)
    const properties = style && style.length ? style : [{}]
    StateStyleSheet.addSelector(data.selector, properties)
    StateCommandCommon.addSelectorLinkClass(data.selector)
  },

  removeSelector (data) {
    StateStyleSheet.saveDeletedSelector(data.selector)
    StyleSheetSelector.deleteSelector(data.selector)
    if (data.ref) StyleSheetSelector.unlinkDeletedClassSelector(data.selector, data.ref)
  },

  sortSelector (data) {
    StateStyleSheet.insertSheetAtPosition(data.selector, data.position, data.target)
    HelperDOM.reflow()
  },

  linkClass (data) {
    StyleSheetSelector.linkClass(data.cls, data.ref)
  },

  unlinkClass (data) {
    StyleSheetSelector.unlinkClass(data.cls, data.ref)
  },

  addColor (data) {
    StyleSheetCommon.addRemoveStyleRules({
      selector: ':root',
      properties: {
        [data.name]: data.value
      }
    }, true)
  },

  removeColor (data) {
    StateStyleSheet.removeStyleRule({
      selector: ':root',
      property: data.name
    })
  },

  async changeText (data) {
    const element = HelperElement.getElement(data.ref)
    element.innerHTML = HelperLocalStore.getItem(data.textId)
    await StateCommandComponent.overrideComponent(element, 'inner', element.innerHTML)
  },

  async changeAttribute (data) {
    const element = HelperElement.getElement(data.ref)
    for (const [name, value] of Object.entries(data.attributes)) {
      StateCommandCommon.setElementAttribute(element, name, value)
    }
    await StateCommandComponent.overrideComponent(element, 'attributes', data.attributes)
  },

  async changeTag (data) {
    let element = HelperElement.getElement(data.ref)
    if (HelperElement.isNormalTag(data.tag)) {
      element = HelperDOM.changeTag(element, data.tag, document)
      element.removeAttributeNS(null, 'data-ss-tag')
    } else {
      element = HelperDOM.changeTag(element, 'div', document)
      element.setAttributeNS(null, 'data-ss-tag', data.tag)
    }
    await StateCommandComponent.overrideComponent(element, 'tag', data.tag)
  },

  async setOptions (data) {
    const element = HelperElement.getElement(data.ref)
    element.innerHTML = data.html
    await StateCommandComponent.overrideComponent(element, 'inner', data.html)
  },

  async setTracks (data) {
    await this.setOptions(data)
  },

  async changeSvg (data) {
    const element = HelperElement.getElement(data.ref)
    element.setAttributeNS(null, 'viewBox', data.viewBox)
    await StateCommandComponent.overrideComponent(element, 'attributes',
      { viewBox: data.viewBox })
    element.innerHTML = data.inner
    await StateCommandComponent.overrideComponent(element, 'inner', data.inner)
  },

  changeProperties (data) {
    const element = HelperElement.getElement(data.ref)
    if (ExtendJS.isEmpty(data.properties)) {
      delete element.dataset.ssProperties
    } else {
      element.dataset.ssProperties = JSON.stringify(data.properties)
    }
  },

  changeComponentProperties (data) {
    const element = HelperElement.getElement(data.ref)
    const componentData = HelperComponent.getComponentData(element)
    if (ExtendJS.isEmpty(data.properties)) {
      delete componentData.properties
    } else {
      componentData.properties = data.properties
    }
    HelperComponent.setComponentData(element, componentData)
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

  assignComponentHole (data) {
    const canvas = document.getElementById('canvas')
    const previous = canvas.getElementsByClassName(data.previous)[0]
    const current = canvas.getElementsByClassName(data.current)[0]
    if (previous) previous.removeAttributeNS(null, 'data-ss-component-hole')
    if (current) current.setAttributeNS(null, 'data-ss-component-hole', '')
  }
}
