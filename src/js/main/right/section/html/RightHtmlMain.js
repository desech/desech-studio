import HelperEvent from '../../../../helper/HelperEvent.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import RightHtmlCommon from './RightHtmlCommon.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import HelperTrigger from '../../../../helper/HelperTrigger.js'
import CanvasElementManage from '../../../canvas/element/CanvasElementManage.js'
import HelperFile from '../../../../helper/HelperFile.js'
import HelperProject from '../../../../helper/HelperProject.js'
import CanvasElementComponent from '../../../canvas/element/CanvasElementComponent.js'

export default {
  getEvents () {
    return {
      change: ['changeTagEvent', 'changeCustomTagEvent'],
      click: ['clickCopyRefEvent', 'clickInsertComponentChildrenEvent', 'clickHideElementEvent',
        'clickShowElementEvent', 'clickDeleteElementEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  changeTagEvent (event) {
    if (event.target.classList.contains('style-tag-dropdown')) {
      this.setTagFromSelect(event.target)
    }
  },

  changeCustomTagEvent (event) {
    if (event.target.classList.contains('style-tag-custom')) {
      this.setTagFromInput(event.target)
    }
  },

  async clickCopyRefEvent (event) {
    if (event.target.classList.contains('style-html-ref')) {
      await this.copyRef(event.target)
    }
  },

  clickInsertComponentChildrenEvent (event) {
    if (event.target.closest('.style-html-component-children')) {
      CanvasElementComponent.insertComponentChildren()
    }
  },

  clickHideElementEvent (event) {
    if (event.target.closest('.style-html-hide')) {
      this.hideElement(event.target.closest('.style-html-hide'))
    }
  },

  clickShowElementEvent (event) {
    if (event.target.closest('.style-html-show')) {
      this.showElement(event.target.closest('.style-html-show'))
    }
  },

  clickDeleteElementEvent (event) {
    if (event.target.closest('.style-html-delete')) {
      this.deleteElement()
    }
  },

  injectMain (template) {
    const data = RightHtmlCommon.getSelectedElementData()
    this.injectTitle(template, data)
    this.injectTag(template.getElementsByClassName('tag-container')[0], data)
    this.injectRef(template, data)
    this.injectComponentChildren(template, data)
    this.injectHidden(template, data)
  },

  injectTitle (template, data) {
    const title = template.getElementsByClassName('style-html-tag-title')[0]
    title.textContent = data.tag.toUpperCase()
  },

  injectTag (container, data) {
    if (data.type !== 'block' && data.type !== 'text') return
    const template = HelperDOM.getTemplate('template-style-tag-dropdown')
    if (data.tag) this.prefillTag(template, data.tag)
    container.appendChild(template)
  },

  prefillTag (template, tag) {
    const select = template.getElementsByClassName('style-tag-dropdown')[0]
    if (!HelperDOM.optionExists(select, tag)) {
      this.prefillCustomTag(select, tag)
    } else {
      select.value = tag
    }
  },

  prefillCustomTag (select, tag) {
    select.value = 'custom'
    select.nextElementSibling.value = tag
    this.showCustomTagInput(select.parentNode, select.nextElementSibling)
  },

  injectRef (template, data) {
    const div = template.getElementsByClassName('style-html-ref')[0]
    div.textContent = data.ref
  },

  injectComponentChildren (template, data) {
    if (!HelperFile.isComponentFile(HelperProject.getFile())) return
    const button = template.getElementsByClassName('style-html-component-children')[0]
    HelperDOM.show(button)
  },

  injectHidden (template, data) {
    if (!data.element.hasAttributeNS(null, 'data-ss-hidden')) return
    const buttonHide = template.getElementsByClassName('style-html-hide')[0]
    const buttonShow = buttonHide.nextElementSibling
    HelperDOM.hide(buttonHide)
    HelperDOM.show(buttonShow)
  },

  setTagFromSelect (select) {
    if (select.value === 'custom') {
      this.showCustomTagInput(select.parentNode, select.nextElementSibling)
    } else if (select.value) {
      this.setDropdownTag(select.parentNode, select.nextElementSibling, select.value)
    }
  },

  setDropdownTag (container, input, tag) {
    this.hideCustomTagInput(container, input)
    this.changeTag(tag)
    HelperTrigger.triggerReload('html-section')
  },

  changeTag (tag) {
    RightHtmlCommon.changeTagCommand(StateSelectedElement.getRef(), tag)
  },

  showCustomTagInput (container, input) {
    container.classList.add('custom')
    HelperDOM.show(input)
  },

  hideCustomTagInput (container, input) {
    container.classList.remove('custom')
    HelperDOM.hide(input)
  },

  setTagFromInput (input) {
    if (!input.value) return
    this.changeTag(input.value.toLowerCase())
    HelperTrigger.triggerReload('html-section')
  },

  async copyRef (div) {
    await navigator.clipboard.writeText(div.textContent)
  },

  hideElement (button) {
    RightHtmlCommon.hideElement(button)
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'element' })
  },

  showElement (button) {
    RightHtmlCommon.showElement(button)
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'element' })
  },

  deleteElement () {
    CanvasElementManage.deleteElement()
  }
}
