import HelperDOM from '../../../../helper/HelperDOM.js'
import HelperFile from '../../../../helper/HelperFile.js'
import HelperColor from '../../../../helper/HelperColor.js'
import StateStyleSheet from '../../../../state/StateStyleSheet.js'
import RightBorderFillProperty from './RightBorderFillProperty.js'
import ColorPickerSwatch from '../../../../component/color-picker/ColorPickerSwatch.js'
import HelperParserBackground from '../../../../helper/parser/HelperParserBackground.js'
import ColorPickerGradient from '../../../../component/color-picker/ColorPickerGradient.js'
import RightBorderImage from './RightBorderImage.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import ColorPickerCommon from '../../../../component/color-picker/ColorPickerCommon.js'
import StyleSheetSelector from '../../../../state/stylesheet/StyleSheetSelector.js'

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
    if (event.target.closest('.border-fill-container .fill-type')) {
      this.changeFillType(event.target.closest('.fill-type'))
    }
  },

  changeFillType (select) {
    const form = select.closest('form')
    const type = form.parentNode.dataset.type
    this.addMain(form, type, select.value)
    this.toggleRadiusWarning(form, select.value)
    this.initFill(form)
  },

  buildForm (form, borderType) {
    const fillType = this.getFillType()
    this.addSwitch(form, fillType)
    this.addMain(form, borderType, fillType)
  },

  getFillType () {
    const image = StateStyleSheet.getPropertyValue('border-image-source')
    if (image) {
      if (image.includes('linear-gradient')) {
        return 'linear-gradient'
      } else if (image.includes('radial-gradient')) {
        return 'radial-gradient'
      } else if (image.includes('url(')) {
        return 'image'
      }
      throw new Error('Unknown fill type')
    } else {
      return 'solid-color'
    }
  },

  addSwitch (form, fillType) {
    const container = form.getElementsByClassName('fill-switch-container')[0]
    const template = HelperDOM.getTemplate('template-border-fill-switch')
    this.injectSwitch(template, fillType)
    HelperDOM.replaceOnlyChild(container, template)
  },

  injectSwitch (template, fillType) {
    template.getElementsByClassName('fill-type')[0].value = fillType
    this.toggleRadiusWarning(template, fillType)
  },

  toggleRadiusWarning (template, fillType) {
    const warning = template.getElementsByClassName('border-image-warnings')[0]
    HelperDOM.toggle(warning, fillType !== 'solid-color')
  },

  addMain (form, borderType, fillType) {
    const container = form.getElementsByClassName('fill-details-container')[0]
    switch (fillType) {
      case 'solid-color':
        this.addSolidColor(container, borderType)
        break
      case 'linear-gradient':
        this.addGradient(container, 'linear')
        break
      case 'radial-gradient':
        this.addGradient(container, 'radial')
        break
      case 'image':
        this.addImage(container)
        break
    }
    ColorPickerSwatch.injectSwatches(container)
  },

  addSolidColor (container, borderType) {
    const template = HelperDOM.getTemplate('template-border-fill-solid-color')
    HelperDOM.replaceOnlyChild(container, template)
    // the color picker needs the dom to be updated before we do any color changes
    this.injectSolidColor(template, borderType)
  },

  injectSolidColor (template, borderType) {
    RightBorderFillProperty.injectColor(template, borderType)
    const selector = StyleSheetSelector.getCurrentSelector()
    RightBorderFillProperty.injectBorderStyle(template, borderType, selector)
  },

  addGradient (container, type) {
    const template = HelperDOM.getTemplate(`template-border-fill-${type}-gradient`)
    HelperDOM.replaceOnlyChild(container, template)
    // the color picker needs the dom to be updated before we do any color changes
    this.injectGradient(template)
    RightBorderImage.injectBorderImage(template)
  },

  injectGradient (template) {
    const source = StateStyleSheet.getPropertyValue('border-image-source')
    if (HelperColor.isGradient(source)) {
      // we only want the first and only gradient
      const data = HelperParserBackground.parse(source)[0]
      ColorPickerGradient.injectGradient(template, data)
      ColorPickerGradient.injectGradientForm(template, data)
      ColorPickerGradient.injectRadialSizeToggle(template, data.line)
    }
  },

  addImage (container) {
    const template = HelperDOM.getTemplate('template-border-fill-image')
    HelperDOM.replaceOnlyChild(container, template)
    // the color picker needs the dom to be updated before we do any color changes
    this.injectImage(container)
    RightBorderImage.injectBorderImage(template)
  },

  injectImage (container) {
    ColorPickerGradient.setBackgroundImageSource(container, this.getImageFile())
  },

  getImageFile () {
    const source = StateStyleSheet.getPropertyValue('border-image-source')
    const regex = source ? /url\("(.*)"\)/gi.exec(source) : null
    return regex ? regex[1] : HelperFile.getDefaultBackgroundImage()
  },

  initFill (form) {
    const colorPicker = form.getElementsByClassName('color-picker')[0]
    if (colorPicker) {
      ColorPickerCommon.triggerColorChangeEvent(colorPicker)
    } else {
      RightBorderFillProperty.changeFill(form)
    }
  }
}
