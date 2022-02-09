import HelperDOM from '../../../../helper/HelperDOM.js'
import RightHtmlCommon from './RightHtmlCommon.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import ExtendJS from '../../../../helper/ExtendJS.js'
import RightHtmlDetailTag from './detail/RightHtmlDetailTag.js'
import RightHtmlDetailOption from './detail/RightHtmlDetailOption.js'
import RightHtmlDetailTrack from './detail/RightHtmlDetailTrack.js'
import SliderComponent from '../../../../component/SliderComponent.js'

export default {
  getEvents () {
    return {
      click: ['clickAttrButtonEvent'],
      change: ['changeAttrFieldEvent', 'changeTextareaValueEvent']
    }
  },

  async clickAttrButtonEvent (event) {
    if (event.target.closest('.style-html-button')) {
      await this.setButtonAttribute(event.target.closest('.style-html-button'))
    }
  },

  async changeAttrFieldEvent (event) {
    if (event.target.classList.contains('style-html-field')) {
      await this.setFieldAttribute(event.target)
    }
  },

  async changeTextareaValueEvent (event) {
    if (event.target.classList.contains('style-html-textarea-value')) {
      await this.setTextareaValue(event.target)
    }
  },

  async setButtonAttribute (button) {
    const ref = StateSelectedElement.getRef()
    await RightHtmlCommon.changeAttributeCommand(ref, {
      [button.name]: this.getButtonValue(button)
    })
  },

  // value: null = delete attr, string = new regular attr
  getButtonValue (button) {
    if (button.classList.contains('selected')) {
      return button.value || ''
    } else {
      return button.dataset.default || null
    }
  },

  async setFieldAttribute (field) {
    const ref = StateSelectedElement.getRef()
    const attributes = { [field.name]: (field.value || null) }
    await RightHtmlCommon.changeAttributeCommand(ref, attributes)
    if (field.name === 'value') {
      // @todo bug: still doesn't reset <progress>
      StateSelectedElement.getElement().value = field.value
    }
  },

  async setTextareaValue (field) {
    await RightHtmlCommon.changeTextareaValue(field.value)
  },

  injectDetails (template, overrides) {
    const data = RightHtmlCommon.getSelectedElementData()
    data.template = this.getTemplateType(data)
    SliderComponent.setOpened(template)
    this.highlightOverrideDetails(template, overrides)
    const container = this.prepareContainer(template, data)
    if (data.template) this.injectDetailsTemplate(container, data)
  },

  getTemplateType (data) {
    if (data.tag === 'input') return data.type
    if (data.type === 'video' || data.type === 'audio') return 'media'
    if (data.tag === 'ins' || data.tag === 'del') return 'ins-del'
    if (data.tag === 'bdo' || data.tag === 'bdi') return 'bdo-bdi'
    const tags = ['a', 'button', 'form', 'svg', 'img', 'iframe', 'object', 'label', 'ol',
      'select', 'textarea', 'datalist', 'time', 'data', 'q', 'map', 'area', 'progress', 'meter',
      'details']
    if (tags.includes(data.tag)) return data.tag
  },

  highlightOverrideDetails (template, overrides) {
    if (!ExtendJS.isEmpty(overrides?.attributes) || !ExtendJS.isEmpty(overrides?.properties)) {
      const div = template.getElementsByClassName('slider-extra-button')[0]
      div.classList.add('override')
    }
  },

  prepareContainer (template, data) {
    const container = template.getElementsByClassName('slider-extra-container')[0]
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
    const name = ExtendJS.capitalize(data.template)
    const method = `injectForm${name}`
    if (typeof this[method] !== 'undefined') {
      this[method](form, data)
    }
  },

  injectFormButton (form, data) {
    RightHtmlDetailTag.updateButtonType(form.elements.type)
  },

  injectFormSvg (form, data) {
    form.elements.code.value = data.element.innerHTML.replace(/\s\s+/g, '')
  },

  injectFormTextarea (form, data) {
    form.elements.inner.value = data.element.innerHTML
  },

  injectFormImg (form, data) {
    const srcset = data.element.getAttributeNS(null, 'srcset')
    RightHtmlDetailTag.injectImageSrcset(form.elements, srcset)
  },

  injectFormObject (form, data) {
    const value = data.element.getAttributeNS(null, 'data')
    if (value) RightHtmlCommon.setFileName(form.elements['data-value'], value)
  },

  injectFormMedia (form, data) {
    RightHtmlDetailTag.injectMediaFiles(form.elements, data.element)
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
