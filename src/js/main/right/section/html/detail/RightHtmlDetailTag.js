import HelperEvent from '../../../../../helper/HelperEvent.js'
import HelperDOM from '../../../../../helper/HelperDOM.js'
import RightHtmlDetailOption from './RightHtmlDetailOption.js'
import RightHtmlCommon from '../RightHtmlCommon.js'
import StateSelectedElement from '../../../../../state/StateSelectedElement.js'
import RightHtmlDetailTrack from './RightHtmlDetailTrack.js'
import HelperElement from '../../../../../helper/HelperElement.js'
import HelperTrigger from '../../../../../helper/HelperTrigger.js'
import HelperFile from '../../../../../helper/HelperFile.js'

export default {
  getEvents () {
    return {
      click: ['clickSelectAddOptionEvent', 'clickSelectDeleteOptionEvent',
        'clickSelectOptionButtonEvent', 'clickMediaControlsButtonEvent', 'clickTrackAddEvent',
        'clickTrackDeleteEvent', 'clickTrackButtonEvent'],
      change: ['changeButtonTypeEvent', 'changeSelectOptionInputEvent', 'changeSvgCodeEvent',
        'changeTrackInputEvent', 'changeInputTextTypeEvent'],
      setsource: ['setsourceImageEvent', 'setsourceVideoEvent', 'setsourcePosterEvent',
        'setsourceTrackEvent'],
      dragdropafter: ['dragdropafterSelectSortOptionEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
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

  clickSelectDeleteOptionEvent (event) {
    if (event.target.closest('.style-html-option-delete')) {
      this.deleteSelectOption(event.target.closest('li'))
    }
  },

  clickSelectOptionButtonEvent (event) {
    if (event.target.closest('.style-html-option-button')) {
      this.updateSelect(event.target.closest('ul'))
    }
  },

  dragdropafterSelectSortOptionEvent (event) {
    if (event.target.classList.contains('style-html-option-list')) {
      this.updateSelect(event.target)
    }
  },

  changeSelectOptionInputEvent (event) {
    if (event.target.classList.contains('style-html-option-input')) {
      this.updateSelect(event.target.closest('ul'))
    }
  },

  changeSvgCodeEvent (event) {
    if (event.target.classList.contains('style-html-svg-code')) {
      this.updateSvgCode(event.target)
    }
  },

  clickMediaControlsButtonEvent (event) {
    if (event.target.closest('.style-html-media-controls')) {
      this.changeMediaControlsButton(event.target.closest('.style-html-media-controls'))
    }
  },

  clickTrackAddEvent (event) {
    if (event.target.closest('.style-html-track-add')) {
      this.addTrack(event.target.closest('.style-html-tracks'))
    }
  },

  clickTrackDeleteEvent (event) {
    if (event.target.closest('.style-html-track-delete')) {
      this.deleteTrack(event.target.closest('.style-html-track-element'))
    }
  },

  clickTrackButtonEvent (event) {
    if (event.target.closest('.style-html-track-button')) {
      this.updateTrackField(event.target.closest('.style-html-track-list'))
    }
  },

  changeTrackInputEvent (event) {
    if (event.target.classList.contains('style-html-track-input')) {
      this.updateTrackField(event.target.closest('.style-html-track-list'))
    }
  },

  changeInputTextTypeEvent (event) {
    if (event.target.classList.contains('style-html-input-type')) {
      this.changeInputTextType(event.target)
    }
  },

  setsourceImageEvent (event) {
    if (event.target.id.startsWith('source-image-detail-')) {
      this.setImageSrcset(event.target, event.detail)
    }
  },

  setsourceVideoEvent (event) {
    if (event.target.id === 'source-media-detail') {
      this.setMediaSource(event.target, event.detail, 'src')
    }
  },

  setsourcePosterEvent (event) {
    if (event.target.id === 'source-poster-detail') {
      this.setMediaSource(event.target, event.detail, 'poster')
    }
  },

  setsourceTrackEvent (event) {
    if (event.target.id.startsWith('source-track-detail-')) {
      this.setTrackSource(event.target, event.detail)
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
    if (container.dataset.type === 'datalist') RightHtmlDetailOption.initDatalist()
  },

  deleteSelectOption (li) {
    const list = li.parentNode
    li.remove()
    this.updateSelect(list)
  },

  updateSelect (list) {
    RightHtmlDetailOption.setOptions(list)
  },

  injectSvg (element, textarea) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttributeNS(null, 'viewBox', element.getAttributeNS(null, 'viewBox'))
    svg.innerHTML = element.innerHTML
    textarea.value = svg.outerHTML.replace(/\s\s+/g, '')
  },

  updateSvgCode (textarea) {
    const svg = new DOMParser().parseFromString(textarea.value, 'image/svg+xml').children[0]
    if (svg.tagName !== 'svg') return
    const element = StateSelectedElement.getElement()
    RightHtmlCommon.setSvgCommand(element, svg)
  },

  injectImageSrcset (fields, srcset) {
    for (const set of srcset.split(', ')) {
      const [file, scaling] = set.split(' ')
      if (!scaling) continue
      RightHtmlCommon.setFileName(fields[`srcset${scaling}`], HelperFile.getSourceFile(file))
    }
  },

  injectMediaFiles (fields, element) {
    RightHtmlCommon.setFileName(fields.src, HelperFile.getSourceFile(element.src))
    if (fields.poster && element.poster) {
      RightHtmlCommon.setFileName(fields.poster, HelperFile.getSourceFile(element.poster))
    }
  },

  injectMediaControlsButton (button, element) {
    if (element.hasAttributeNS(null, 'data-ss-controls')) button.classList.add('selected')
  },

  injectInputText (select, element) {
    select.value = element.type
    this.updateInputTypeForm(select)
  },

  changeMediaControlsButton (button) {
    const value = button.classList.contains('selected')
    RightHtmlCommon.changeAttributeCommand(StateSelectedElement.getRef(), {
      controls: value,
      'data-ss-controls': value
    })
  },

  addTrack (container) {
    const list = container.getElementsByClassName('style-html-track-list')[0]
    RightHtmlCommon.addTrackToList(list)
  },

  deleteTrack (element) {
    const list = element.parentNode
    element.remove()
    this.updateTracks(list)
  },

  updateTracks (list) {
    RightHtmlDetailTrack.setTracks(list)
  },

  updateTrackField (list) {
    this.updateTracks(list)
  },

  changeInputTextType (select) {
    this.updateInputTypeForm(select)
    this.setInputTextType(select.value)
    HelperTrigger.triggerReload('html-section')
  },

  updateInputTypeForm (select) {
    select.closest('form').dataset.type = select.value
  },

  setInputTextType (type) {
    const element = StateSelectedElement.getElement()
    RightHtmlCommon.changeAttributeCommand(HelperElement.getRef(element), {
      type: type,
      ...RightHtmlCommon.getRemovableAttributes(element)
    })
  },

  setImageSrcset (button, file) {
    this.addFileName(button.closest('.grid'), file)
    this.saveImageSrcset(button.closest('form').elements)
  },

  addFileName (container, file) {
    const field = container.getElementsByClassName('style-html-source-name')[0]
    RightHtmlCommon.setFileName(field, file)
  },

  saveImageSrcset (fields) {
    RightHtmlCommon.changeAttributeCommand(StateSelectedElement.getRef(), {
      srcset: this.buildSrcset(fields)
    })
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

  setMediaSource (button, file, attr) {
    this.addFileName(button.closest('.grid'), file)
    this.saveMediaSource(file, attr)
  },

  saveMediaSource (file, attr) {
    RightHtmlCommon.changeAttributeCommand(StateSelectedElement.getRef(), {
      [attr]: file
    })
  },

  setTrackSource (button, file) {
    this.addFileName(button.closest('.grid'), file)
    this.updateTrackField(button.closest('.style-html-track-list'))
  }
}
