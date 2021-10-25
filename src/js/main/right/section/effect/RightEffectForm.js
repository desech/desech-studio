import HelperDOM from '../../../../helper/HelperDOM.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import RightEffectType from './RightEffectType.js'
import RightCommon from '../../RightCommon.js'
import RightEffectCommon from './type/RightEffectCommon.js'
import StateStyleSheet from '../../../../state/StateStyleSheet.js'

export default {
  getEvents () {
    return {
      change: ['changeEffectTypeEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  async changeEffectTypeEvent (event) {
    if (event.target.closest('.effect-form-container .effect-type')) {
      await this.changeEffectType(event.target)
    }
  },

  async changeEffectType (select) {
    const property = select.selectedOptions[0].dataset.type
    const container = select.closest('#effect-section')
    if (await this.validateGeneralValue(container, property, select.value)) {
      return
    }
    RightEffectType.moveEffect(container, property)
    this.addMain(select.closest('form'), property, select.value)
    await RightEffectType.setEffect(container, property, select.value)
  },

  async validateGeneralValue (container, property, value) {
    const values = RightEffectCommon.getGeneralValues()
    if (!values.includes(value)) return
    this.cleanForGeneralValue(container, property, value)
    await RightCommon.changeStyle({ [property]: value })
    return true
  },

  cleanForGeneralValue (container, property, value) {
    const list = container.getElementsByClassName(`effect-list-${property}`)[0]
    HelperDOM.deleteChildren(list)
    RightEffectType.insertElement(list, property, value, { function: value })
    const options = container.getElementsByClassName('effect-form-container')[0]
    HelperDOM.deleteChildren(options)
  },

  buildForm (form, type, subtype, elemIndex) {
    const value = RightEffectType.getValueAtIndex(type, elemIndex)
    this.addSwitch(form, subtype)
    this.addMain(form, type, subtype, value)
  },

  addSwitch (form, subtype) {
    const container = form.getElementsByClassName('effect-switch-container')[0]
    const template = HelperDOM.getTemplate('template-effect-switch')
    this.injectSwitch(template, subtype)
    HelperDOM.replaceOnlyChild(container, template)
  },

  injectSwitch (template, value) {
    const select = template.getElementsByClassName('effect-type')[0]
    select.value = value
    this.disableSwitchOptions(select)
  },

  disableSwitchOptions (select) {
    // disable the option groups for effects with general values like `none`, `inherit` etc
    const css = StateStyleSheet.getCurrentStyleObject()
    const general = RightEffectCommon.getGeneralValues()
    const effects = RightEffectCommon.getEffectProperties()
    for (const property of effects) {
      if (!general.includes(css[property])) continue
      const group = select.querySelector(`optgroup[data-type="${property}"]`)
      group.setAttributeNS(null, 'disabled', '')
    }
  },

  addMain (form, type, subtype, value = {}) {
    const container = form.getElementsByClassName('effect-details-container')[0]
    const template = RightEffectType.getTemplate(type, subtype)
    // we need the form to exist before manipulating it
    HelperDOM.replaceOnlyChild(container, template)
    RightEffectType.injectData(type, template, value, subtype)
  }
}
