import HelperDOM from '../../../../helper/HelperDOM.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import RightEffectType from './RightEffectType.js'

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
    const type = select.selectedOptions[0].dataset.type
    const subtype = select.value
    RightEffectType.moveEffect(select.closest('#effect-section'), type)
    this.addMain(select.closest('form'), type, subtype)
    RightEffectType.setEffect(select.closest('#effect-section'), type, subtype)
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
