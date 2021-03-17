import HelperDOM from '../../helper/HelperDOM.js'
import HelperEvent from '../../helper/HelperEvent.js'
import ColorPickerCommon from './ColorPickerCommon.js'

export default {
  getEvents () {
    return {
      change: ['changeRadialSizeEvent', 'changeFieldEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  changeRadialSizeEvent (event) {
    if (event.target.classList.contains('gradient-size')) {
      this.changeRadialSize(event.target)
    }
  },

  changeFieldEvent (event) {
    if (event.target.classList.contains('gradient-field')) {
      this.updateField(event.target)
    }
  },

  changeRadialSize (select) {
    const container = select.parentNode.nextElementSibling
    HelperDOM.toggle(container, select.value === 'length')
  },

  updateField (field) {
    const container = field.closest('.fill-details-container').getElementsByClassName('color-picker')[0]
    ColorPickerCommon.triggerColorChangeEvent(container)
  }
}
