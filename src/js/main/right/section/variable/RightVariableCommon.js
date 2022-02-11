import StyleSheetCommon from '../../../../state/stylesheet/StyleSheetCommon.js'
import StateStyleSheet from '../../../../state/StateStyleSheet.js'
import HelperGlobal from '../../../../helper/HelperGlobal.js'
import HelperForm from '../../../../helper/HelperForm.js'
import ExtendJS from '../../../../helper/ExtendJS.js'
import StateSelectedVariable from '../../../../state/StateSelectedVariable.js'

export default {
  sanitizeVariable (name) {
    // only allow alphanumeric and dashes
    return name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
  },

  isExecuteAction (value) {
    const array = ['var-desech-input-create', 'var-desech-input-update']
    return array.includes(value)
  },

  getOptionByValue (select, value) {
    for (const option of select.options) {
      if (option.value === value) return option
    }
  },

  // dialog/variable.html, variable/template.html, RightVariableCommon.getPropertyType()
  getPropertyType (name) {
    switch (name) {
      case 'min-width': case 'max-width':
        return 'width'
      case 'min-height': case 'max-height':
        return 'height'
      case 'margin-top': case 'margin-right': case 'margin-bottom': case 'margin-left':
        return 'margin'
      case 'padding-top': case 'padding-right': case 'padding-bottom': case 'padding-left':
        return 'padding'
      default:
        return name
    }
  },

  getStyleProperties (data, value) {
    const style = StateStyleSheet.getCurrentStyleObject(data.selector)
    if ((['margin', 'padding'].includes(data.type)) &&
      this.isMarginPaddingSame(data.type, style)) {
      return {
        [`${data.type}-top`]: value,
        [`${data.type}-right`]: value,
        [`${data.type}-bottom`]: value,
        [`${data.type}-left`]: value
      }
    }
    return { [data.propertyName]: value }
  },

  isMarginPaddingSame (type, data) {
    const value = data[`${type}-top`]
    for (const dir of ['bottom', 'left', 'right']) {
      if (value !== data[`${type}-${dir}`]) return false
    }
    return true
  },

  validateName (input) {
    input.value = this.sanitizeVariable(input.value)
    const duplicate = HelperGlobal.checkVarByName(input.value)
    HelperForm.reportFieldError(input, !duplicate, 'errorDuplicate')
    if (duplicate) return
    const numeric = ExtendJS.startsNumeric(input.value)
    HelperForm.reportFieldError(input, !numeric, 'errorInvalid')
  },

  createVariable (data) {
    HelperGlobal.addVariable(data)
    if (data.propertyName) this.addStyleProperty(data)
    this.addStyleVariable(data)
    StateSelectedVariable.selectVariable(data.ref)
  },

  addStyleProperty (data) {
    StyleSheetCommon.addRemoveStyleRules({
      selector: data.selector,
      properties: this.getStyleProperties(data, `var(--${data.ref})`)
    })
  },

  addStyleVariable (data) {
    StyleSheetCommon.addRemoveStyleRules({
      selector: ':root',
      properties: { ['--' + data.ref]: data.value }
    })
  },

  deleteVariable (data) {
    HelperGlobal.removeVariable(data.ref)
    if (data.propertyName) this.revertStyleProperty(data)
    this.deleteStyleVariable(data.ref)
    StateSelectedVariable.deselectVariable()
  },

  revertStyleProperty (data) {
    StyleSheetCommon.addRemoveStyleRules({
      selector: data.selector,
      properties: this.getStyleProperties(data, data.value)
    })
  },

  deleteStyleVariable (ref) {
    StateStyleSheet.removeStyleRule({
      selector: ':root',
      property: '--' + ref
    })
  },

  updateVariable (ref, data) {
    if ('name' in data) {
      HelperGlobal.updateVariable(ref, 'name', data.name)
    } else if ('value' in data) {
      HelperGlobal.updateVariable(ref, 'value', data.value)
      this.updateStyleVariable(ref, data.value)
    }
  },

  updateStyleVariable (ref, value) {
    StyleSheetCommon.addRemoveStyleRules({
      selector: ':root',
      properties: { ['--' + ref]: value }
    })
  }
}
