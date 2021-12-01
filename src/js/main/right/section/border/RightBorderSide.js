import InputUnitField from '../../../../component/InputUnitField.js'
import StateStyleSheet from '../../../../state/StateStyleSheet.js'
import RightBorderFill from './RightBorderFill.js'
import HelperStyle from '../../../../helper/HelperStyle.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import RightCommon from '../../RightCommon.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import RightBorderFillCommon from './RightBorderFillCommon.js'

export default {
  getEvents () {
    return {
      click: ['clickSideEvent'],
      change: ['changeStyleAllEvent', 'changeStyleEachEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickSideEvent (event) {
    if (event.target.closest('button.switch-main')) {
      this.clickSide(event.target.closest('button.switch-main'))
    }
  },

  async changeStyleAllEvent (event) {
    if (event.target.classList.contains('border-width')) {
      await this.changeWidthAll(event.target)
    }
  },

  async changeStyleEachEvent (event) {
    if (event.target.classList.contains('border-width-each')) {
      await this.changeWidthEach(event.target)
    }
  },

  clickSide (button) {
    this.selectButton(button)
    const form = button.closest('form')
    RightBorderFillCommon.hideFillContainer(form)
    const data = RightCommon.getSectionData()
    this.injectSide(form, data, button.value)
  },

  selectButton (button) {
    const selected = button.parentNode.getElementsByClassName('selected')[0]
    if (selected) selected.classList.remove('selected')
    button.classList.add('selected')
  },

  async changeStyle (input, infix = '') {
    const value = InputUnitField.getValue(input)
    const properties = this.getStyleProperties(value, infix)
    await RightCommon.changeStyle(properties)
  },

  getStyleProperties (value, infix = '') {
    return infix ? this.getOneSideProperties(value, infix) : this.getAllSidesProperties(value)
  },

  getOneSideProperties (value, infix) {
    const type = this.getTypeFromInfix(infix)
    const fullValue = StateStyleSheet.getPropertyValue('border-image-width')
    return {
      [`border${infix}-width`]: value,
      'border-image-width': HelperStyle.set4SidesValue(type, value, fullValue),
      [`border${infix}-style`]: this.getStyleValue(infix, value)
    }
  },

  getAllSidesProperties (value) {
    return {
      'border-top-width': value,
      'border-bottom-width': value,
      'border-left-width': value,
      'border-right-width': value,
      'border-image-width': value,
      'border-top-style': this.getStyleValue('-top', value),
      'border-bottom-style': this.getStyleValue('-bottom', value),
      'border-left-style': this.getStyleValue('-left', value),
      'border-right-style': this.getStyleValue('-right', value)
    }
  },

  getStyleValue (infix, value) {
    if (!value) return ''
    return StateStyleSheet.getPropertyValue(`border${infix}-style`) || 'solid'
  },

  getTypeFromInfix (infix) {
    return infix ? infix.substring(1) : 'all'
  },

  async changeWidthAll (input) {
    await this.changeStyle(input)
  },

  async changeWidthEach (input) {
    const infix = '-' + input.name.split('-')[1]
    await this.changeStyle(input, infix)
  },

  injectSide (form, data, type = 'all') {
    this.injectSideContainer(form, type)
    this.injectSize(form, data, type)
    RightBorderFill.injectFill(form, type)
  },

  injectSideContainer (container, type) {
    const block = container.getElementsByClassName('border-side-container')[0]
    const template = HelperDOM.getTemplate(`template-border-side-${type}`)
    HelperDOM.replaceOnlyChild(block, template)
  },

  injectSize (form, data, type) {
    if (type === 'all') {
      this.injectSizeAll(form.elements['border-width'], data)
      return form.elements['border-width']
    } else {
      this.injectOneSize(form, data, type)
    }
  },

  injectSizeAll (field, data) {
    if (data.style['border-top-width'] && data.style['border-right-width'] &&
      data.style['border-bottom-width'] && data.style['border-left-width']) {
      InputUnitField.setValue(field, data.style['border-top-width'],
        data.computedStyle['border-top-width'])
    }
  },

  injectOneSize (form, data, type) {
    // top, bottom, left, right
    const name = `border-${type}-width`
    InputUnitField.setValue(form.elements[name], data.style[name], data.computedStyle[name])
    return form.elements[name]
  }
}
