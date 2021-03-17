import StateStyleSheet from '../../../../state/StateStyleSheet.js'
import RightCommon from '../../RightCommon.js'

export default {
  injectTextColor (container, type) {
    const color = StateStyleSheet.getPropertyValue(this.getTypeProperty(type))
    this.getColorButton(container, type).style.backgroundColor = color
    if (color) this.selectColorButton(container, type)
  },

  getTypeProperty (type) {
    return (type === 'decoration-color') ? 'text-decoration-color' : 'color'
  },

  selectColorButton (container, type) {
    const button = container.querySelector(`.text-${type}-button .color-button-on`)
    button.previousElementSibling.classList.remove('selected')
    button.classList.add('selected')
  },

  getColorButton (container, type) {
    return container.querySelector(`.text-${type}-button .color-button`)
  },

  switchTextColor (container, type) {
    const property = this.getTypeProperty(type)
    const cssColor = StateStyleSheet.getPropertyValue(property)
    const buttonColor = this.getColorButton(container, type).style.backgroundColor
    if (!cssColor && buttonColor) RightCommon.changeStyle({ [property]: buttonColor })
  }
}
