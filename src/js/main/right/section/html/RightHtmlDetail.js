import HelperEvent from '../../../../helper/HelperEvent.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import RightHtmlCommon from './RightHtmlCommon.js'
import HelperLocalStore from '../../../../helper/HelperLocalStore.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import ExtendJS from '../../../../helper/ExtendJS.js'
import RightHtmlDetailTag from './detail/RightHtmlDetailTag.js'
import RightHtmlDetailOption from './detail/RightHtmlDetailOption.js'
import RightHtmlDetailTrack from './detail/RightHtmlDetailTrack.js'

export default {
  getEvents () {
    return {
      click: ['clickToggleContainerEvent', 'clickAttrButtonEvent'],
      change: ['changeAttrFieldEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickToggleContainerEvent (event) {
    if (event.target.closest('.html-details-button')) {
      this.toggleContainer(event.target.closest('.html-details-main'))
    }
  },

  clickAttrButtonEvent (event) {
    if (event.target.closest('.style-html-button')) {
      this.setButtonAttribute(event.target.closest('.style-html-button'))
    }
  },

  changeAttrFieldEvent (event) {
    if (event.target.classList.contains('style-html-field')) {
      this.setFieldAttribute(event.target)
    }
  },

  toggleContainer (container) {
    container.classList.contains('opened')
      ? this.closeContainer(container)
      : this.openContainer(container)
  },

  openContainer (container) {
    container.classList.add('opened')
    HelperLocalStore.setItem('right-html-details-expand', 'opened')
  },

  closeContainer (container) {
    container.classList.remove('opened')
    HelperLocalStore.removeItem('right-html-details-expand')
  },

  setButtonAttribute (button) {
    RightHtmlCommon.changeAttributeCommand(StateSelectedElement.getRef(), {
      [button.name]: this.getButtonValue(button)
    })
  },

  getButtonValue (button) {
    const boolean = !button.value
    if (button.classList.contains('selected')) {
      return boolean ? true : button.value
    } else {
      return boolean ? false : (button.dataset.default || '')
    }
  },

  setFieldAttribute (field) {
    RightHtmlCommon.changeAttributeCommand(StateSelectedElement.getRef(), {
      [field.name]: field.value
    })
  },

  injectDetails (template) {
    const data = RightHtmlCommon.getSelectedElementData()
    data.template = this.getTemplateType(data)
    this.setOpened(template)
    const container = this.prepareContainer(template, data)
    if (data.template) this.injectDetailsTemplate(container, data)
  },

  getTemplateType (data) {
    if (data.tag === 'input') return data.type
    if (data.type === 'video' || data.type === 'audio') return 'media'
    if (data.tag === 'ins' || data.tag === 'del') return 'ins-del'
    if (data.tag === 'bdo' || data.tag === 'bdi') return 'bdo-bdi'
    const tags = ['a', 'button', 'form', 'svg', 'img', 'iframe', 'object', 'label', 'ol',
      'select', 'textarea', 'datalist', 'time', 'data', 'q', 'map', 'area', 'progress', 'meter']
    if (tags.includes(data.tag)) return data.tag
  },

  setOpened (template) {
    const main = template.getElementsByClassName('html-details-main')[0]
    if (HelperLocalStore.getItem('right-html-details-expand')) {
      main.classList.add('opened')
    }
  },

  prepareContainer (template, data) {
    const container = template.getElementsByClassName('html-details-container')[0]
    container.dataset.type = data.type
    container.dataset.template = data.template || ''
    return container
  },

  injectDetailsTemplate (container, data) {
    const form = HelperDOM.getTemplate(`template-style-html-attr-${data.template}`)
    this.injectFormFields(form, data)
    this.injectCustomLogic(form, data)
    container.appendChild(form)
  },

  injectFormFields (form, data) {
    for (const field of form.elements) {
      this.injectFormFieldInput(field, data)
      this.injectFormFieldButton(field, data)
    }
  },

  injectFormFieldInput (field, data) {
    if (field.classList.contains('style-html-field')) {
      field.value = data.element.getAttributeNS(null, field.name) || ''
    }
  },

  injectFormFieldButton (field, data) {
    if (field.classList.contains('style-html-button') &&
      data.element.hasAttributeNS(null, field.name) &&
      (!field.value || field.value === data.element.getAttributeNS(null, field.name))) {
      field.classList.add('selected')
    }
  },

  injectCustomLogic (form, data) {
    const name = ExtendJS.capitalize(ExtendJS.toCamelCase(data.template))
    const method = `injectForm${name}`
    if (typeof this[method] !== 'undefined') this[method](form, data)
  },

  injectFormButton (form, data) {
    RightHtmlDetailTag.updateButtonType(form.elements.type)
  },

  injectFormSvg (form, data) {
    RightHtmlDetailTag.injectSvg(data.element, form.elements.code)
  },

  injectFormImg (form, data) {
    const srcset = data.element.getAttributeNS(null, 'srcset')
    RightHtmlDetailTag.injectImageSrcset(form.elements, srcset)
  },

  injectFormObject (form, data) {
    const value = data.element.getAttributeNS(null, 'data')
    if (value) RightHtmlCommon.setFileName(form.elements.data, value)
  },

  injectFormMedia (form, data) {
    RightHtmlDetailTag.injectMediaFiles(form.elements, data.element)
    RightHtmlDetailTag.injectMediaControlsButton(form.elements.controls, data.element)
    RightHtmlDetailTrack.injectTracks(form, data.element)
  },

  injectFormInput (form, data) {
    RightHtmlDetailTag.injectInputText(form.elements.type, data.element)
  },

  injectFormDatalist (form, data) {
    RightHtmlDetailOption.injectOptions(form, data.element)
  },

  injectFormSelect (form, data) {
    RightHtmlDetailOption.injectOptions(form, data.element)
  }
}
