import ChangeStyleField from '../../../../component/ChangeStyleField.js'
import RightCommon from '../../RightCommon.js'

export default {
  getEvents () {
    return {
      change: ['changeUpdateCustomNameEvent']
    }
  },

  async changeUpdateCustomNameEvent (event) {
    if (event.target.classList.contains('style-css-name')) {
      await this.updateCustomName(event.target)
    }
  },

  async updateCustomName (nameField) {
    if (!nameField.value) return
    const valueField = nameField.closest('li').getElementsByClassName('style-css-field')[0]
    valueField.name = nameField.value
    await RightCommon.changeStyle({ [valueField.name]: valueField.value })
    nameField.setAttributeNS(null, 'disabled', '')
  },

  async setPropertyStyle (field) {
    const value = ChangeStyleField.getValue(field)
    if (field.name) await RightCommon.changeStyle({ [field.name]: value })
  },

  async removePropertyStyle (name) {
    await RightCommon.changeStyle({ [name]: '' })
  }
}
