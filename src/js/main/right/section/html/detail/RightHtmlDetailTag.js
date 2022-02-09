import HelperDOM from '../../../../../helper/HelperDOM.js'
import RightHtmlDetailOption from './RightHtmlDetailOption.js'
import RightHtmlCommon from '../RightHtmlCommon.js'
import StateSelectedElement from '../../../../../state/StateSelectedElement.js'
import RightHtmlDetailTrack from './RightHtmlDetailTrack.js'
import HelperElement from '../../../../../helper/HelperElement.js'
import HelperTrigger from '../../../../../helper/HelperTrigger.js'

export default {
  getEvents () {
    return {
      click: ['clickSelectAddOptionEvent', 'clickSelectDeleteOptionEvent',
        'clickSelectOptionButtonEvent', 'clickTrackAddEvent', 'clickTrackDeleteEvent',
        'clickTrackButtonEvent', 'clickToggleLiveButtonEvent'],
      change: ['changeButtonTypeEvent', 'changeSelectOptionInputEvent', 'changeSvgCodeEvent',
        'changeTrackInputEvent', 'changeInputTextTypeEvent'],
      setsource: ['setsourceImageEvent', 'setsourceVideoEvent', 'setsourcePosterEvent',
        'setsourceTrackEvent', 'setsourceObjectEvent'],
      dragdropafter: ['dragdropafterSelectSortOptionEvent']
    }
  },

  changeButtonTypeEvent (event) {
    if (event.target.classList.contains('style-html-button-type')) {
      this.updateButtonType(event.target)
    }
  },

  clickSelectAddOptionEvent (event) {
    if (event.target.closest('.style-html-select-add')) {
      this.addSelectOption(event.target.closest('.style-html-select-add'))
    }
  },

  async clickSelectDeleteOptionEvent (event) {
    if (event.target.closest('.style-html-option-delete')) {
      await this.deleteSelectOption(event.target.closest('li'))
    }
  },

  async clickSelectOptionButtonEvent (event) {
    if (event.target.closest('.style-html-option-button')) {
      await this.updateSelect(event.target.closest('ul'))
    }
  },

  clickToggleLiveButtonEvent (event) {
    if (event.target.closest('.style-live-button')) {
      this.toggleLiveButton(event.target.closest('.style-live-button'))
    }
  },

  async dragdropafterSelectSortOptionEvent (event) {
    if (event.target.classList.contains('style-html-option-list')) {
      await this.updateSelect(event.target)
    }
  },

  async changeSelectOptionInputEvent (event) {
    if (event.target.classList.contains('style-html-option-input')) {
      await this.updateSelect(event.target.closest('ul'))
    }
  },

  async changeSvgCodeEvent (event) {
    if (event.target.classList.contains('style-html-svg-code')) {
      await this.updateSvgCode(event.target.closest('form').elements)
    }
  },

  clickTrackAddEvent (event) {
    if (event.target.closest('.style-html-track-add')) {
      this.addTrack(event.target.closest('.style-html-tracks'))
    }
  },

  async clickTrackDeleteEvent (event) {
    if (event.target.closest('.style-html-track-delete')) {
      await this.deleteTrack(event.target.closest('.style-html-track-element'))
    }
  },

  async clickTrackButtonEvent (event) {
    if (event.target.closest('.style-html-track-button')) {
      await this.updateTrackField(event.target.closest('.style-html-track-list'))
    }
  },

  async changeTrackInputEvent (event) {
    if (event.target.classList.contains('style-html-track-input')) {
      await this.updateTrackField(event.target.closest('.style-html-track-list'))
    }
  },

  async changeInputTextTypeEvent (event) {
    if (event.target.classList.contains('style-html-input-type')) {
      await this.changeInputTextType(event.target)
    }
  },

  async setsourceImageEvent (event) {
    if (event.target.id.startsWith('source-image-detail-')) {
      await this.setImageSrcset(event.target, event.detail)
    }
  },

  async setsourceVideoEvent (event) {
    if (event.target.id === 'source-media-detail') {
      await this.setAttrSource(event.target, event.detail, 'src')
    }
  },

  async setsourcePosterEvent (event) {
    if (event.target.id === 'source-poster-detail') {
      await this.setAttrSource(event.target, event.detail, 'poster')
    }
  },

  setsourceTrackEvent (event) {
    if (event.target.id.startsWith('source-track-detail-')) {
      this.setTrackSource(event.target, event.detail)
    }
  },

  async setsourceObjectEvent (event) {
    if (event.target.id === 'source-object-detail') {
      await this.setAttrSource(event.target, event.detail, 'data')
    }
  },

  updateButtonType (select) {
    const container = select.closest('form').getElementsByClassName('submit-button-container')[0]
    HelperDOM.toggle(container, select.value === 'submit')
  },

  addSelectOption (button) {
    const container = button.closest('.style-html-options')
    const list = container.getElementsByClassName('style-html-option-list')[0]
    RightHtmlCommon.addSelectOptionToList(list, { type: button.dataset.type })
    const input = list.lastElementChild.getElementsByTagName('input')[0]
    input.focus()
  },

  async deleteSelectOption (li) {
    const list = li.parentNode
    li.remove()
    await this.updateSelect(list)
  },

  async updateSelect (list) {
    await RightHtmlDetailOption.setOptions(list)
  },

  async updateSvgCode (fields) {
    const node = await this.getSvgNode(fields.code.value.trim(), fields.viewBox.value)
    if (!node) return
    fields.code.value = node.innerHTML
    fields.viewBox.value = node.getAttributeNS(null, 'viewBox')
    const element = StateSelectedElement.getElement()
    await RightHtmlCommon.setSvgCommand(element, node)
  },

  async getSvgNode (string, viewbox) {
    const svgString = await this.getSvgFromString(string, viewbox)
    const node = new DOMParser().parseFromString(svgString, 'image/svg+xml').children[0]
    if (node?.tagName !== 'svg' || node.getElementsByTagName('parsererror').length) {
      throw new Error('Invalid SVG')
    }
    return node
  },

  async getSvgFromString (string, viewbox) {
    if (string.startsWith('http')) {
      const response = await fetch(string)
      return await response.text()
    } else if (string.startsWith('<svg') || string.startsWith('<?xml')) {
      return string
    } else {
      return `<svg viewBox="${viewbox}">${string}</svg>`
    }
  },

  injectImageSrcset (fields, srcset) {
    for (const set of srcset.split(', ')) {
      const [file, scaling] = set.split(' ')
      if (!scaling) continue
      RightHtmlCommon.setFileName(fields[`srcset${scaling}`], file)
    }
  },

  injectMediaFiles (fields, element) {
    RightHtmlCommon.setFileName(fields['src-value'], element.getAttributeNS(null, 'src'))
    if (fields['poster-value'] && element.poster) {
      RightHtmlCommon.setFileName(fields['poster-value'], element.getAttributeNS(null, 'poster'))
    }
  },

  injectInputText (select, element) {
    select.value = element.type
    this.updateInputTypeForm(select)
  },

  addTrack (container) {
    const list = container.getElementsByClassName('style-html-track-list')[0]
    RightHtmlCommon.addTrackToList(list)
  },

  async deleteTrack (element) {
    const list = element.parentNode
    element.remove()
    await this.updateTracks(list)
  },

  async updateTracks (list) {
    await RightHtmlDetailTrack.setTracks(list)
  },

  async updateTrackField (list) {
    await this.updateTracks(list)
  },

  async changeInputTextType (select) {
    this.updateInputTypeForm(select)
    await this.setInputTextType(select.value)
    HelperTrigger.triggerReload('html-section')
  },

  updateInputTypeForm (select) {
    const dateTypes = ['date', 'time', 'datetime-local']
    const value = dateTypes.includes(select.value) ? 'date' : select.value
    select.closest('form').dataset.type = value
  },

  async setInputTextType (type) {
    const element = StateSelectedElement.getElement()
    const ref = HelperElement.getRef(element)
    await RightHtmlCommon.changeAttributeCommand(ref, {
      ...RightHtmlCommon.getRemovableAttributes(element),
      type
    })
  },

  async setImageSrcset (button, file) {
    this.addFileName(button.closest('.grid'), file)
    await this.saveImageSrcset(button.closest('form').elements)
  },

  addFileName (container, file) {
    const field = container.getElementsByClassName('style-html-source-name')[0]
    RightHtmlCommon.setFileName(field, file)
  },

  async saveImageSrcset (fields) {
    const ref = StateSelectedElement.getRef()
    const srcset = this.buildSrcset(fields)
    await RightHtmlCommon.changeAttributeCommand(ref, { srcset })
  },

  buildSrcset (fields) {
    let src = ''
    for (let i = 1; i <= 3; i++) {
      src = this.buildAddSrcset(src, encodeURI(fields[`srcset${i}x`].value), i)
    }
    return src
  },

  buildAddSrcset (src, value, scaling) {
    if (!value) return src
    if (src) src += ', '
    src += `${value} ${scaling}x`
    return src
  },

  async setAttrSource (button, file, attr) {
    this.addFileName(button.closest('.grid'), file)
    const ref = StateSelectedElement.getRef()
    await RightHtmlCommon.changeAttributeCommand(ref, { [attr]: file })
  },

  async setTrackSource (button, file) {
    this.addFileName(button.closest('.grid'), file)
    await this.updateTrackField(button.closest('.style-html-track-list'))
  },

  toggleLiveButton (button) {
    const element = StateSelectedElement.getElement()
    element[button.name] = button.classList.contains('selected')
  }
}
