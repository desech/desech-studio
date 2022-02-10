import HelperDOM from '../../../helper/HelperDOM.js'
import HelperProject from '../../../helper/HelperProject.js'
import HelperFile from '../../../helper/HelperFile.js'
import ExtendJS from '../../../helper/ExtendJS.js'

export default {
  getSection () {
    const template = HelperDOM.getTemplate('template-style-page')
    if (HelperFile.isComponentFile()) {
      this.hideFields(template)
    } else {
      this.injectFields(template)
    }
    return template
  },

  hideFields (container) {
    const form = container.getElementsByClassName('right-page-form')[0]
    HelperDOM.hide(form)
  },

  injectFields (container) {
    const fields = container.getElementsByClassName('right-page-form')[0].elements
    const data = HelperProject.getFileMeta()
    if (!data) return
    fields.language.value = data.language
    fields.title.value = data.title
    fields.meta.value = ExtendJS.removeExtraSpace(data.meta)
  }
}
