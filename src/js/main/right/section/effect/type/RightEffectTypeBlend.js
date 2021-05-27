import StateStyleSheet from '../../../../../state/StateStyleSheet.js'
import HelperDOM from '../../../../../helper/HelperDOM.js'

export default {
  getTemplate () {
    return HelperDOM.getTemplate('template-effect-mix-blend-mode')
  },

  getParsedValues () {
    const source = StateStyleSheet.getPropertyValue('mix-blend-mode')
    return this.parseCSS(source)
  },

  parseCSS (value) {
    return value ? [{ value }] : []
  },

  injectData (container, data) {
    const fields = container.closest('form').elements
    fields['mix-blend-mode'].value = data.value || 'normal'
  },

  getDisplayedValue (section) {
    const fields = section.getElementsByClassName('slide-container')[0].elements
    return fields['mix-blend-mode'].value
  },

  getLabelExtra (data) {
    return data.value
  }
}
