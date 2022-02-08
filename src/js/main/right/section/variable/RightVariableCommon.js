import StyleSheetCommon from '../../../../state/stylesheet/StyleSheetCommon.js'
import StateStyleSheet from '../../../../state/StateStyleSheet.js'
import HelperGlobal from '../../../../helper/HelperGlobal.js'

export default {
  sanitizeVariable (name) {
    // only allow alphanumeric and dashes
    return name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
  },

  isExecuteValue (value) {
    const array = ['var-desech-input-create', 'var-desech-input-edit']
    return array.includes(value)
  },

  getOptionByValue (select, value) {
    for (const option of select.options) {
      if (option.value === value) return option
    }
  },

  getPropertySet (name) {
    switch (name) {
      case 'width': case 'min-width': case 'max-width':
        return 'width'
      case 'height': case 'min-height': case 'max-height':
        return 'height'
      case 'margin-top': case 'margin-right': case 'margin-bottom': case 'margin-left':
        return 'margin'
      case 'padding-top': case 'padding-right': case 'padding-bottom': case 'padding-left':
        return 'padding'
    }
  },

  createVariable (variable, style) {
    HelperGlobal.addVariable(variable)
    this.addStyleProperty(variable, style)
    this.addStyleVariable(variable)
  },

  addStyleProperty (variable, style) {
    StyleSheetCommon.addRemoveStyleRules({
      selector: style.selector,
      responsive: style.responsive,
      properties: { [variable.propertyName]: `var(--${variable.variableName})` }
    })
  },

  addStyleVariable (variable) {
    StyleSheetCommon.addRemoveStyleRules({
      selector: ':root',
      properties: { ['--' + variable.variableName]: variable.propertyValue }
    })
  },

  deleteVariable (variable, style = null) {
    HelperGlobal.removeVariable(variable.variableName)
    if (!style) return
    this.revertStyleProperty(variable, style)
    this.deleteStyleVariable(variable)
  },

  revertStyleProperty (variable, style) {
    StyleSheetCommon.addRemoveStyleRules({
      selector: style.selector,
      responsive: style.responsive,
      properties: { [variable.propertyName]: variable.propertyValue }
    })
  },

  deleteStyleVariable (variable) {
    StateStyleSheet.removeStyleRule({
      selector: ':root',
      property: '--' + variable.variableName
    })
  }
}
