import HelperGlobal from '../../../../helper/HelperGlobal.js'
import HelperDOM from '../../../../helper/HelperDOM.js'

export default {
  injectInputUnit (fields) {
    for (const select of fields) {
      if (select.classList.contains('variable-field')) {
        this.addVariables(select)
        this.toggleOptions(select)
      }
    }
  },

  addVariables (select) {
    const optgroup = select.options[select.options.length - 1].parentNode
    for (const [varName, varVal] of Object.entries(HelperGlobal.getVariables())) {
      if (varVal.name === select.dataset.name) {
        this.addVariableOption(optgroup, varName)
      }
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
    const createOpt = this.getOptionByValue(select, 'desech-variable-input-create')
    const updateOpt = this.getOptionByValue(select, 'desech-variable-input-update')
    this.showAllVariables(select)
    if (input.value.startsWith('var(--')) {
      this.toggleUpdate(createOpt, updateOpt, select, input)
    } else if (!input.value) {
      this.toggleNone(createOpt, updateOpt, select)
    } else {
      this.toggleCreate(createOpt, updateOpt, select)
    }
  },

  getOptionByValue (select, value) {
    for (const option of select.options) {
      if (option.value === value) return option
    }
  },

  toggleUpdate (createOpt, updateOpt, select, input) {
    HelperDOM.hide(createOpt)
    HelperDOM.show(updateOpt)
    HelperDOM.hide(this.getOptionByValue(select, input.value))
  },

  toggleCreate (createOpt, updateOpt, select) {
    HelperDOM.show(createOpt)
    HelperDOM.hide(updateOpt)
  },

  toggleNone (createOpt, updateOpt, select) {
    HelperDOM.hide(createOpt)
    HelperDOM.hide(updateOpt)
  },

  showAllVariables (select) {
    for (const option of select.options) {
      if (option.value.startsWith('var(--') && option.hasAttributeNS(null, 'hidden')) {
        HelperDOM.show(option)
      }
    }
  }
}
