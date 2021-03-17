import HelperDOM from '../../../helper/HelperDOM.js'
import ChangeStyleField from '../../../component/ChangeStyleField.js'
import RightTextFont from './text/RightTextFont.js'
import RightTextDecoration from './text/RightTextDecoration.js'
import RightTextCommon from './text/RightTextCommon.js'

export default {
  getSection (style) {
    const template = this.getTemplate()
    this.injectData(template, style)
    return template
  },

  getTemplate () {
    return HelperDOM.getTemplate('template-style-text')
  },

  injectData (template, style) {
    ChangeStyleField.injectFields(template, style)
    RightTextFont.injectFontList(template)
    RightTextFont.injectFontFamily(template)
    RightTextCommon.injectTextColor(template, 'color')
    RightTextDecoration.injectTextDecorationLine(template)
  }
}
