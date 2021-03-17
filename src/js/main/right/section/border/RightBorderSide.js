import InputUnitField from '../../../../component/InputUnitField.js'
import StateStyleSheet from '../../../../state/StateStyleSheet.js'
import RightBorderFill from './RightBorderFill.js'
import HelperStyle from '../../../../helper/HelperStyle.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import RightCommon from '../../RightCommon.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import RightBorderFillCommon from './RightBorderFillCommon.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'

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

  changeStyleAllEvent (event) {
    if (event.target.classList.contains('border-width')) {
      this.changeWidthAll(event.target)
    }
  },

  changeStyleEachEvent (event) {
    if (event.target.classList.contains('border-width-each')) {
      this.changeWidthEach(event.target)
    }
  },

  clickSide (button) {
    this.selectButton(button)
    const form = button.closest('form')
    RightBorderFillCommon.hideFillContainer(form)
    const style = StateSelectedElement.getStyle()
    this.injectSide(form, style, button.value)
  },

  selectButton (button) {
    const selected = button.parentNode.getElementsByClassName('selected')[0]
    if (selected) selected.classList.remove('selected')
    button.classList.add('selected')
  },

  changeStyle (input, infix = '') {
    const value = InputUnitField.getValue(input)
    const properties = this.getStyleProperties(value, infix)
    RightCommon.changeStyle(properties)
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

  changeWidthAll (input) {
    this.changeStyle(input)
  },

  changeWidthEach (input) {
    const infix = '-' + input.name.split('-')[1]
    this.changeStyle(input, infix)
  },

  injectSide (form, style, type = 'all') {
    this.injectSideContainer(form, type)
    this.injectSize(form, style, type)
    RightBorderFill.injectFill(form, type)
  },

  injectSideContainer (container, type) {
    const block = container.getElementsByClassName('border-side-container')[0]
    const template = HelperDOM.getTemplate(`template-border-side-${type}`)
    HelperDOM.replaceOnlyChild(block, template)
  },

  injectSize (form, style, type) {
    const css = StateStyleSheet.getCurrentStyleObject()
    if (type === 'all') {
      const name = 'border-top-width'
      InputUnitField.setValue(form.elements['border-width'], css[name], style[name])
      return form.elements['border-width']
    } else { // top, bottom, left, right
      const name = `border-${type}-width`
      InputUnitField.setValue(form.elements[name], css[name], style[name])
      return form.elements[name]
    }
  }
}
