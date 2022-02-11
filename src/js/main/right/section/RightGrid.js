import HelperDOM from '../../../helper/HelperDOM.js'
import ChangeStyleField from '../../../component/ChangeStyleField.js'
import RightGridTrack from './grid/RightGridTrack.js'
import RightVariableInject from './variable/RightVariableInject.js'

export default {
  getSection (sectionData) {
    const template = this.getTemplate()
    this.injectData(template, sectionData)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-grid')
  },

  injectData (form, sectionData) {
    RightGridTrack.injectTrack(form, 'row', sectionData.style)
    RightGridTrack.injectTrack(form, 'column', sectionData.style)
    this.injectFields(form, sectionData)
  },

  injectFields (form, sectionData) {
    // this skips the track forms; we deal with the track in RightGridTrack.injectVariables()
    RightVariableInject.injectAllFieldVariables(form.elements)
    ChangeStyleField.injectFields(form, sectionData)
    RightVariableInject.updateAllFieldVariables(form.elements)
  }
}
