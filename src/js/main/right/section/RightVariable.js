import HelperDOM from '../../../helper/HelperDOM.js'
import StateSelectedVariable from '../../../state/StateSelectedVariable.js'
import InputUnitField from '../../../component/InputUnitField.js'

export default {
  getSection () {
    const template = this.getTemplate()
    this.injectData(template)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-variable')
  },

  injectData (template) {
    const data = StateSelectedVariable.getVariable()
    const fields = template.getElementsByClassName('right-variable-form')[0].elements
    fields.name.value = data.name
    this.injectFieldValue(template, data)
  },

  injectFieldValue (container, data) {
    const parent = container.getElementsByClassName('right-variable-value')[0]
    const template = HelperDOM.getTemplate(`template-variable-${data.type}`)
    const input = template.getElementsByClassName('input-unit-value')[0]
    InputUnitField.setValue(input, data.value)
    HelperDOM.replaceOnlyChild(parent, template)
  }
}
