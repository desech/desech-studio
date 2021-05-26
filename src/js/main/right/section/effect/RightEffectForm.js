import HelperDOM from '../../../../helper/HelperDOM.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import RightEffectType from './RightEffectType.js'
import RightCommon from '../../RightCommon.js'

export default {
  getEvents () {
    return {
      change: ['changeEffectTypeEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  changeEffectTypeEvent (event) {
    if (event.target.closest('.effect-form-container .effect-type')) {
      this.changeEffectType(event.target)
    }
  },

  changeEffectType (select) {
    const property = select.selectedOptions[0].dataset.type
    const container = select.closest('#effect-section')
    if (this.validateGeneralValue(container, property, select.value)) return
    RightEffectType.moveEffect(container, property)
    this.addMain(select.closest('form'), property, select.value)
    RightEffectType.setEffect(container, property, select.value)
  },

  validateGeneralValue (container, property, value) {
    const values = ['none', 'inherit', ' initial', 'unset']
    if (!values.includes(value)) return
    this.cleanForGeneralValue(container, property, value)
    RightCommon.changeStyle({ [property]: value })
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

  injectSwitch (template, subtype) {
    template.getElementsByClassName('effect-type')[0].value = subtype
  },

  addMain (form, type, subtype, value = {}) {
    const container = form.getElementsByClassName('effect-details-container')[0]
    const template = RightEffectType.getTemplate(type, subtype)
    HelperDOM.replaceOnlyChild(container, template) // we need the form to exist before manipulating it
    RightEffectType.injectData(type, template, value, subtype)
  }
}
