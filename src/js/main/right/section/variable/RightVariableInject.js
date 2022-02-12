import HelperGlobal from '../../../../helper/HelperGlobal.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import RightVariableCommon from './RightVariableCommon.js'

export default {
  injectAllFieldVariables (fields) {
    for (const field of fields) {
      if (HelperDOM.getTag(field) === 'select') {
        this.injectFieldVariables(field)
      }
    }
  },

  injectFieldVariables (select) {
    const option = RightVariableCommon.getOptionByValue(select, 'var-desech-input-create')
    if (!option) return
    const optgroup = option.parentNode
    const type = RightVariableCommon.getPropertyType(select.dataset.name || select.name)
    const variables = HelperGlobal.getVariables().data
    for (const [ref, variable] of Object.entries(variables)) {
      if (variable.type === type) {
        this.addVariableOption(optgroup, ref, variable.name)
      }
    }
  },

  addVariableOption (optgroup, ref, name) {
    const option = document.createElement('option')
    option.value = `var(--${ref})`
    option.textContent = name
    optgroup.appendChild(option)
  },

  updateAllFieldVariables (fields) {
    for (const field of fields) {
      if (HelperDOM.getTag(field) === 'select') {
        this.updateFieldVariables(field)
      }
    }
  },

  updateFieldVariables (field) {
    if (field.closest('.component-input-unit')) {
      this.processUnitField(field.closest('.component-input-unit'))
    } else {
      this.toggleOptions(field, field.dataset.value || field.value)
    }
  },

  processUnitField (container) {
    const select = container.getElementsByClassName('input-unit-measure')[0]
    const input = container.getElementsByClassName('input-unit-value')[0]
    this.toggleOptions(select, input.value)
  },

  toggleOptions (select, varValue) {
    const createOpt = RightVariableCommon.getOptionByValue(select, 'var-desech-input-create')
    if (!createOpt) return
    const updateOpt = RightVariableCommon.getOptionByValue(select, 'var-desech-input-update')
    this.resetAllVariables(select)
    const varExists = HelperGlobal.checkVarByRef(varValue)
    this.toggleOptionsCond(select, varValue, createOpt, updateOpt, varExists)
  },

  resetAllVariables (select) {
    for (const option of select.options) {
      if (option.value.startsWith('var(--') && option.classList.contains('selected')) {
        option.classList.remove('selected')
        option.removeAttributeNS(null, 'disabled')
      }
    }
  },

  toggleOptionsCond (select, varValue, createOpt, updateOpt, varExists) {
    if (varValue.startsWith('var(--') && varExists) {
      this.toggleUpdateIfExists(createOpt, updateOpt, select, varValue)
    } else if (varValue.startsWith('var(--') || !varValue) {
      this.toggleNoneOrMissing(createOpt, updateOpt, select)
    } else {
      this.toggleCreate(createOpt, updateOpt, select)
    }
  },

  toggleUpdateIfExists (createOpt, updateOpt, select, varValue) {
    HelperDOM.hide(createOpt)
    HelperDOM.show(updateOpt)
    const option = RightVariableCommon.getOptionByValue(select, varValue)
    if (option) {
      option.classList.add('selected')
      option.setAttributeNS(null, 'disabled', '')
    }
  },

  toggleNoneOrMissing (createOpt, updateOpt, select) {
    HelperDOM.hide(createOpt)
    HelperDOM.hide(updateOpt)
  },

  toggleCreate (createOpt, updateOpt, select) {
    HelperDOM.show(createOpt)
    HelperDOM.hide(updateOpt)
  }
}
