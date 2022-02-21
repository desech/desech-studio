import StyleSheetCommon from '../../../../state/stylesheet/StyleSheetCommon.js'
import StateStyleSheet from '../../../../state/StateStyleSheet.js'
import HelperGlobal from '../../../../helper/HelperGlobal.js'
import HelperForm from '../../../../helper/HelperForm.js'
import ExtendJS from '../../../../helper/ExtendJS.js'
import StateSelectedVariable from '../../../../state/StateSelectedVariable.js'
import HelperCanvas from '../../../../helper/HelperCanvas.js'

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

  // right/variable.html, RightVariableCommon.getPropertyType(), getStyleProperties()
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
      case 'grid-template-columns': case 'grid-template-rows':
        return 'grid-template-cells'
      case 'column-gap': case 'row-gap':
        return 'gap'
      case 'fill': case 'stroke': case 'text-decoration-color':
        return 'color'
      case 'border-top-left-radius': case 'border-top-right-radius':
      case 'border-bottom-left-radius': case 'border-bottom-right-radius':
      case 'border-top-left-radius-vertical': case 'border-top-right-radius-vertical':
      case 'border-bottom-left-radius-vertical': case 'border-bottom-right-radius-vertical':
      case 'border-radius-vertical':
        return 'border-radius'
      case 'border-top-width': case 'border-right-width': case 'border-bottom-width':
      case 'border-left-width':
        return 'border-width'
      default:
        return name
    }
  },

  // this is when we apply the variable value to the element style
  getStyleProperties (data, value) {
    const style = StateStyleSheet.getCurrentStyleObject(data.selector)
    if ((['margin', 'padding'].includes(data.type)) &&
      this.isMarginPaddingSame(data.type, style)) {
      return this.getFacesStyle(value, data.type + '-')
    } else if (data.propertyName === 'border-radius') {
      return this.getBorderRadiusAllStyle(value)
    } else if (data.propertyName === 'border-width') {
      return this.getFacesStyle(value, 'border-', '-width')
    } else {
      return { [data.propertyName]: value }
    }
  },

  isMarginPaddingSame (type, data) {
    const value = data[`${type}-top`]
    for (const dir of ['bottom', 'left', 'right']) {
      if (value !== data[`${type}-${dir}`]) return false
    }
    return true
  },

  getFacesStyle (value, prefix, sufix = '') {
    return {
      [`${prefix}top${sufix}`]: value,
      [`${prefix}right${sufix}`]: value,
      [`${prefix}bottom${sufix}`]: value,
      [`${prefix}left${sufix}`]: value
    }
  },

  getBorderRadiusAllStyle (value) {
    return {
      'border-top-left-radius': value,
      'border-top-right-radius': value,
      'border-bottom-left-radius': value,
      'border-bottom-right-radius': value
    }
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
    // we want the the style to be applied to the current responsive mode
    StyleSheetCommon.addRemoveStyleRules({
      selector: data.selector,
      properties: this.getStyleProperties(data, `var(--${data.ref})`),
      responsive: HelperCanvas.getCurrentResponsiveWidth()
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
    // we want the the style to be applied to the current responsive mode
    StyleSheetCommon.addRemoveStyleRules({
      selector: data.selector,
      properties: this.getStyleProperties(data, data.value),
      responsive: HelperCanvas.getCurrentResponsiveWidth()
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
