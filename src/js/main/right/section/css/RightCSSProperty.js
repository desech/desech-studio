import ChangeStyleField from '../../../../component/ChangeStyleField.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import RightCommon from '../../RightCommon.js'

export default {
  getEvents () {
    return {
      change: ['changeUpdateCustomNameEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  changeUpdateCustomNameEvent (event) {
    if (event.target.classList.contains('style-css-name')) {
      this.updateCustomName(event.target)
    }
  },

  updateCustomName (nameField) {
    if (!nameField.value) return
    const valueField = nameField.closest('li').getElementsByClassName('style-css-field')[0]
    valueField.name = nameField.value
    RightCommon.changeStyle({ [valueField.name]: valueField.value })
    nameField.setAttributeNS(null, 'disabled', '')
  },

  setPropertyStyle (field) {
    const value = ChangeStyleField.getValue(field)
    if (field.name) RightCommon.changeStyle({ [field.name]: value })
  },

  removePropertyStyle (name) {
    RightCommon.changeStyle({ [name]: '' })
  }
}
