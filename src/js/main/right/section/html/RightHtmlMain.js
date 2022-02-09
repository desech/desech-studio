import HelperDOM from '../../../../helper/HelperDOM.js'
import RightHtmlCommon from './RightHtmlCommon.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import HelperTrigger from '../../../../helper/HelperTrigger.js'
import CanvasElementCopyElement from '../../../canvas/element/copypaste/CanvasElementCopyElement.js'
import CanvasElementComponent from '../../../canvas/element/CanvasElementComponent.js'
import HelperElement from '../../../../helper/HelperElement.js'
import HelperComponent from '../../../../helper/HelperComponent.js'
import RightCommon from '../../RightCommon.js'

export default {
  getEvents () {
    return {
      change: ['changeTagEvent', 'changeCustomTagEvent'],
      click: ['clickCopyRefEvent', 'clickAssignComponentHoleEvent', 'clickHideElementEvent',
        'clickShowElementEvent', 'clickUnrenderElementEvent', 'clickRenderElementEvent',
        'clickDeleteElementEvent']
    }
  },

  async changeTagEvent (event) {
    if (event.target.classList.contains('style-tag-dropdown')) {
      await this.setTagFromSelect(event.target)
    }
  },

  async changeCustomTagEvent (event) {
    if (event.target.classList.contains('style-tag-custom')) {
      await this.setTagFromInput(event.target)
    }
  },

  async clickCopyRefEvent (event) {
    if (event.target.classList.contains('style-html-ref')) {
      await this.copyRef(event.target)
    }
  },

  async clickAssignComponentHoleEvent (event) {
    if (event.target.closest('.style-html-component-hole')) {
      await CanvasElementComponent.assignComponentHole(event.target.closest('form'))
    }
  },

  async clickHideElementEvent (event) {
    if (event.target.closest('.style-html-hide')) {
      await this.hideElement(event.target.closest('.style-html-top-line'))
    }
  },

  async clickShowElementEvent (event) {
    if (event.target.closest('.style-html-show')) {
      await this.showElement(event.target.closest('.style-html-top-line'))
    }
  },

  async clickUnrenderElementEvent (event) {
    if (event.target.closest('.style-html-unrender')) {
      await this.unrenderElement(event.target.closest('.style-html-top-line'))
    }
  },

  async clickRenderElementEvent (event) {
    if (event.target.closest('.style-html-render')) {
      await this.renderElement(event.target.closest('.style-html-top-line'))
    }
  },

  async clickDeleteElementEvent (event) {
    if (event.target.closest('.style-html-delete')) {
      await CanvasElementCopyElement.deleteElement()
    }
  },

  injectMain (template, overridesExist) {
    const data = RightHtmlCommon.getSelectedElementData()
    RightCommon.injectResetOverrides(template, overridesExist)
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
    div.textContent = (data.refs.type === 'element')
      ? data.refs.position
      : data.refs.position + ' ' + data.refs.style
  },

  injectTopLine (template, data) {
    const container = template.getElementsByClassName('style-html-top-line')[0]
    if (HelperDOM.isHidden(data.element)) {
      container.classList.add('hidden')
    }
    if (HelperElement.isUnrender(data.element)) {
      container.classList.add('unrender')
    }
    if (data.type === 'body' || data.type === 'inline') {
      container.classList.add(data.type)
    }
    if (!HelperComponent.isMovableElement(data.element)) {
      container.classList.add('immovable')
    }
    this.injectComponentHole(container, data)
  },

  injectComponentHole (container, data) {
    if (!HelperComponent.canAssignComponentHole(data.element)) return
    container.classList.add('component-hole')
    const same = HelperElement.getRef(data.element) === HelperComponent.getMainHole()
    CanvasElementComponent.swapButtons(container, same)
  },

  async setTagFromSelect (select) {
    if (select.value === 'custom') {
      this.showCustomTagInput(select.parentNode, select.nextElementSibling)
    } else if (select.value) {
      await this.setDropdownTag(select.parentNode, select.nextElementSibling, select.value)
    }
  },

  async setDropdownTag (container, input, tag) {
    this.hideCustomTagInput(container, input)
    await this.changeTag(tag)
    HelperTrigger.triggerReload('html-section')
  },

  async changeTag (tag) {
    const ref = StateSelectedElement.getRef()
    await RightHtmlCommon.changeTagCommand(ref, tag)
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

  async setTagFromInput (input) {
    if (!input.value) return
    await this.changeTag(input.value.toLowerCase())
    HelperTrigger.triggerReload('html-section')
  },

  async copyRef (div) {
    await navigator.clipboard.writeText(div.textContent)
  },

  async hideElement (container) {
    await RightHtmlCommon.setHidden(true)
    container.classList.add('hidden')
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'element' })
  },

  async showElement (container) {
    await RightHtmlCommon.setHidden(false)
    container.classList.remove('hidden')
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'element' })
  },

  async unrenderElement (container) {
    await RightHtmlCommon.setUnrender(true)
    container.classList.add('unrender')
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'element' })
  },

  async renderElement (container) {
    await RightHtmlCommon.setUnrender(false)
    container.classList.remove('unrender')
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'element' })
  }
}
