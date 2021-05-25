import HelperDOM from '../../../../helper/HelperDOM.js'
import HelperParserBackground from '../../../../helper/parser/HelperParserBackground.js'
import ColorPickerGradient from '../../../../component/color-picker/ColorPickerGradient.js'
import ColorPickerSwatch from '../../../../component/color-picker/ColorPickerSwatch.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import RightFillProperty from './RightFillProperty.js'
import RightFillImage from './RightFillImage.js'
import RightFillCommon from './RightFillCommon.js'
import ColorPickerCommon from '../../../../component/color-picker/ColorPickerCommon.js'
import HelperFile from '../../../../helper/HelperFile.js'
import RightCommon from '../../RightCommon.js'

export default {
  getEvents () {
    return {
      change: ['changeFillTypeEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  changeFillTypeEvent (event) {
    if (event.target.closest('.background-fill-container .fill-type')) {
      this.changeFillType(event.target.closest('.fill-type'))
    }
  },

  changeFillType (select) {
    if (this.validateFillNone(select)) return
    const form = select.closest('form.slide-container')
    const elemIndex = RightFillCommon.getActiveElementIndex(form.closest('#fill-section'))
    this.addMain(form, { type: select.value, value: '' }, elemIndex)
    this.updateFill(form)
  },

  validateFillNone (select) {
    if (select.value !== 'none') return
    this.cleanForFillNone(select.closest('.sidebar-section'))
    RightCommon.changeStyle({ 'background-image': 'none' })
    return true
  },

  cleanForFillNone (container) {
    const list = container.getElementsByClassName('fill-list')[0]
    HelperDOM.deleteChildren(list)
    RightFillCommon.insertElement(list, 'none')
    const picker = container.getElementsByClassName('background-fill-container')[0]
    HelperDOM.deleteChildren(picker)
  },

  buildForm (form, elemIndex) {
    const background = RightFillProperty.getBackgroundData(elemIndex)
    this.addSwitch(form, background.type)
    this.addMain(form, background, elemIndex)
  },

  addSwitch (form, fillType) {
    const container = form.getElementsByClassName('fill-switch-container')[0]
    const template = HelperDOM.getTemplate('template-fill-switch')
    this.injectSwitch(template, fillType)
    HelperDOM.replaceOnlyChild(container, template)
  },

  injectSwitch (template, fillType) {
    template.getElementsByClassName('fill-type')[0].value = fillType
  },

  addMain (form, background, elemIndex) {
    const container = form.getElementsByClassName('fill-details-container')[0]
    switch (background.type) {
      case 'solid-color':
        this.addSolidColor(container, background.value, elemIndex)
        break
      case 'linear-gradient':
        this.addGradient(container, background, elemIndex)
        break
      case 'radial-gradient':
        this.addGradient(container, background, elemIndex)
        break
      case 'image':
        this.addImage(container, background.value, elemIndex)
        break
    }
    ColorPickerSwatch.injectSwatches(container)
  },

  addSolidColor (container, value, elemIndex) {
    const template = HelperDOM.getTemplate('template-fill-solid-color')
    // the color picker needs the dom to be updated before we do any color changes
    HelperDOM.replaceOnlyChild(container, template)
    RightFillProperty.injectColor(template, value)
    RightFillImage.injectBackgroundImage(template, elemIndex)
  },

  addGradient (container, background, elemIndex) {
    const template = HelperDOM.getTemplate(`template-fill-${background.type}`)
    // the color picker needs the dom to be updated before we do any color changes
    HelperDOM.replaceOnlyChild(container, template)
    if (background.value) this.injectGradient(template, background.value)
    RightFillImage.injectBackgroundImage(template, elemIndex)
  },

  injectGradient (template, value) {
    const data = HelperParserBackground.parse(value)[0]
    ColorPickerGradient.injectGradient(template, data)
    ColorPickerGradient.injectGradientForm(template, data)
    ColorPickerGradient.injectRadialSizeToggle(template, data.line)
  },

  addImage (container, value, elemIndex) {
    const template = HelperDOM.getTemplate('template-fill-image')
    HelperDOM.replaceOnlyChild(container, template)
    // the color picker needs the dom to be updated before we do any color changes
    this.injectImage(container, value)
    RightFillImage.injectBackgroundImage(template, elemIndex)
  },

  injectImage (container, background) {
    const file = background ? /url\("(.*)"\)/gi.exec(background)[1] : null
    const image = file || HelperFile.getDefaultBackgroundImage()
    ColorPickerGradient.setBackgroundImageSource(container, image)
  },

  updateFill (form) {
    const colorPicker = form.getElementsByClassName('color-picker')[0]
    if (colorPicker) {
      ColorPickerCommon.triggerColorChangeEvent(colorPicker)
    } else {
      RightFillProperty.updateBackgroundImage(form)
    }
  }
}
