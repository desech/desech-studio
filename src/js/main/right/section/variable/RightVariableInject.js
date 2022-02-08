import HelperGlobal from '../../../../helper/HelperGlobal.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import RightVariableCommon from './RightVariableCommon.js'

export default {
  injectInputUnitFields (fields) {
    for (const select of fields) {
      if (select.classList.contains('variable-field')) {
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
    const set = RightVariableCommon.getPropertySet(select.dataset.name)
    for (const [varName, varVal] of Object.entries(HelperGlobal.getVariables())) {
      if (varVal.set === set) this.addVariableOption(optgroup, varName)
    }
  },

  addVariableOption (optgroup, varName) {
    const option = document.createElement('option')
    option.textContent = varName
    option.value = `var(--${varName})`
    optgroup.appendChild(option)
  },

  toggleOptions (select) {
    const input = select.closest('form').elements[select.dataset.name]
    const createOpt = RightVariableCommon.getOptionByValue(select, 'var-desech-input-create')
    const updateOpt = RightVariableCommon.getOptionByValue(select, 'var-desech-input-update')
    this.resetAllVariables(select)
    const varExists = HelperGlobal.variableExists(input.value)
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
      }
    }
  },

  toggleUpdateIfExists (createOpt, updateOpt, select, input) {
    HelperDOM.hide(createOpt)
    HelperDOM.show(updateOpt)
    const option = RightVariableCommon.getOptionByValue(select, input.value)
    option.classList.add('selected')
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
