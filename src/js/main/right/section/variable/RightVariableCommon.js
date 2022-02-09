import StyleSheetCommon from '../../../../state/stylesheet/StyleSheetCommon.js'
import StateStyleSheet from '../../../../state/StateStyleSheet.js'
import HelperGlobal from '../../../../helper/HelperGlobal.js'

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

  getPropertyType (name) {
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

  createVariable (variable, style = null) {
    HelperGlobal.addVariable(variable)
    if (style) this.addStyleProperty(variable, style)
    this.addStyleVariable(variable)
  },

  addStyleProperty (variable, style) {
    StyleSheetCommon.addRemoveStyleRules({
      selector: style.selector,
      properties: { [style.propertyName]: `var(--${variable.ref})` }
    })
  },

  addStyleVariable (variable) {
    StyleSheetCommon.addRemoveStyleRules({
      selector: ':root',
      properties: { ['--' + variable.ref]: variable.value }
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
  },

  deleteVariable (variable, style = null) {
    HelperGlobal.removeVariable(variable.ref)
    if (style) this.revertStyleProperty(variable, style)
    this.deleteStyleVariable(variable)
  },

  revertStyleProperty (variable, style) {
    StyleSheetCommon.addRemoveStyleRules({
      selector: style.selector,
      properties: { [style.propertyName]: variable.value }
    })
  },

  deleteStyleVariable (variable) {
    StateStyleSheet.removeStyleRule({
      selector: ':root',
      property: '--' + variable.ref
    })
  }
}
