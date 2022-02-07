import StyleSheetCommon from '../../../../state/stylesheet/StyleSheetCommon.js'
import StateStyleSheet from '../../../../state/StateStyleSheet.js'

export default {
  sanitizeVariable (name) {
    // only allow alphanumeric and dashes
    return name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
  },

  isExecuteValue (value) {
    const array = ['desech-variable-input-create', 'desech-variable-input-edit']
    return array.includes(value)
  },

  async createVariable (variable, style) {
    await window.electron.invoke('rendererCreateVariable', variable)
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

  async deleteVariable (variable, style = null) {
    await window.electron.invoke('rendererDeleteVariable', variable)
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
