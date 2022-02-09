import HelperGlobal from '../../../../helper/HelperGlobal.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import RightVariableCommon from './RightVariableCommon.js'

export default {
  injectInputUnitFields (fields) {
    for (const select of fields) {
      if (select.classList.contains('input-unit-measure')) {
        this.injectInputUnitField(select)
      }
    }
  },

  injectInputUnitField (select) {
    this.addVariables(select)
    this.toggleOptions(select)
  },

  addVariables (select) {
    const option = RightVariableCommon.getOptionByValue(select, 'var-desech-input-create')
    const optgroup = option.parentNode
    const type = RightVariableCommon.getPropertyType(select.dataset.name)
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

  toggleOptions (select) {
    const input = select.closest('form').elements[select.dataset.name]
    const createOpt = RightVariableCommon.getOptionByValue(select, 'var-desech-input-create')
    const updateOpt = RightVariableCommon.getOptionByValue(select, 'var-desech-input-update')
    this.resetAllVariables(select)
    const varExists = HelperGlobal.checkVarByRef(input.value)
    if (input.value.startsWith('var(--') && varExists) {
      this.toggleUpdateIfExists(createOpt, updateOpt, select, input)
    } else if (input.value.startsWith('var(--') || !input.value) {
      this.toggleNoneOrMissing(createOpt, updateOpt, select)
    } else {
      this.toggleCreate(createOpt, updateOpt, select)
    }
  },

  resetAllVariables (select) {
    for (const option of select.options) {
      if (option.value.startsWith('var(--') && option.classList.contains('selected')) {
        option.classList.remove('selected')
        option.removeAttributeNS(null, 'disabled')
      }
    }
  },

  toggleUpdateIfExists (createOpt, updateOpt, select, input) {
    HelperDOM.hide(createOpt)
    HelperDOM.show(updateOpt)
    const option = RightVariableCommon.getOptionByValue(select, input.value)
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
