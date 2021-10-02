import HelperEvent from '../../../../helper/HelperEvent.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import RightHtmlCommon from './RightHtmlCommon.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import HelperTrigger from '../../../../helper/HelperTrigger.js'
import CanvasElementManage from '../../../canvas/element/CanvasElementManage.js'
import HelperFile from '../../../../helper/HelperFile.js'
import HelperProject from '../../../../helper/HelperProject.js'
import CanvasElementComponent from '../../../canvas/element/CanvasElementComponent.js'
import HelperElement from '../../../../helper/HelperElement.js'

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
      this.hideElement(event.target.closest('.style-html-top-line'))
    }
  },

  clickShowElementEvent (event) {
    if (event.target.closest('.style-html-show')) {
      this.showElement(event.target.closest('.style-html-top-line'))
    }
  },

  clickDeleteElementEvent (event) {
    if (event.target.closest('.style-html-delete')) {
      CanvasElementManage.deleteElement()
    }
  },

  injectMain (template) {
    const data = RightHtmlCommon.getSelectedElementData()
    this.injectTitle(template, data)
    this.injectTagInDropdown(template, data)
    this.injectRef(template, data)
    this.injectTopLine(template, data)
  },

  injectTitle (template, data) {
    const title = template.getElementsByClassName('style-html-tag-title')[0]
    title.textContent = data.tag.toUpperCase()
  },

  injectTagInDropdown (main, data) {
    const container = main.getElementsByClassName('tag-container')[0]
    if (data.type !== 'block' && data.type !== 'text') return
    const template = HelperDOM.getTemplate('template-style-tag-dropdown')
    if (data.tag) this.prefillTag(template, data.tag)
    container.appendChild(template)
  },

  prefillTag (template, tag) {
    const select = template.getElementsByClassName('style-tag-dropdown')[0]
    if (HelperElement.isNormalTag(tag) || HelperElement.isSpecialTag(tag)) {
      select.value = tag
    } else {
      this.prefillCustomTag(select, tag)
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

  injectTopLine (template, data) {
    const container = template.getElementsByClassName('style-html-top-line')[0]
    if (!HelperDOM.isVisible(data.element)) container.classList.add('hidden')
    if (data.type === 'body' || data.type === 'inline') {
      container.classList.add(data.type)
    }
    this.injectComponentChildren(container, data)
  },

  injectComponentChildren (container, data) {
    if (data.type === 'block' && HelperFile.isComponentFile(HelperProject.getFile())) {
      container.classList.add('component-children')
    }
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
    input.focus()
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

  hideElement (container) {
    RightHtmlCommon.setHidden(true)
    container.classList.add('hidden')
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'element' })
  },

  showElement (container) {
    RightHtmlCommon.setHidden(false)
    container.classList.remove('hidden')
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'element' })
  }
}
