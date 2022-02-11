import HelperDOM from '../../../helper/HelperDOM.js'
import StateSelectedVariable from '../../../state/StateSelectedVariable.js'
import ChangeStyleField from '../../../component/ChangeStyleField.js'

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
    this.injectRef(template, data)
    fields.name.value = data.name
    fields.type.value = data.type
    this.injectValue(template, data)
  },

  injectRef (container, data) {
    const node = container.getElementsByClassName('right-variable-ref')[0]
    node.textContent = data.ref
  },

  injectValue (container, data) {
    const parent = container.getElementsByClassName('right-variable-value-container')[0]
    const template = HelperDOM.getTemplate(`template-variable-${data.type}`)
    HelperDOM.replaceOnlyChild(parent, template)
    const field = parent.querySelector('input,select,button')
    ChangeStyleField.setValue(field, data.value)
  }
}
