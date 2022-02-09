import HelperDOM from '../../../helper/HelperDOM.js'
import StateSelectedVariable from '../../../state/StateSelectedVariable.js'
import HelperVariable from '../../../helper/HelperVariable.js'

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
    const ref = StateSelectedVariable.getRef()
    const data = HelperVariable.getVariable(ref)
    const fields = template.getElementsByClassName('right-variable-form')[0].elements
    fields.name.value = data.name
  }
}
