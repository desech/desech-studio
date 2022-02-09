import HelperVariable from './HelperVariable.js'

export default {
  initGlobal () {
    window.desech = {}
  },

  getGlobal () {
    return window.desech
  },

  setVariables (data) {
    window.desech.variables = data
  },

  getVariables () {
    return window.desech.variables
  },

  addVariable (data) {
    window.desech.variables.data[data.ref] = {
      name: data.name,
      type: data.type,
      value: data.value
    }
  },

  updateVariable (ref, key, value) {
    window.desech.variables.data[ref][key] = value
  },

  removeVariable (ref) {
    delete window.desech.variables.data[ref]
  },

  checkVarByRef (ref) {
    ref = HelperVariable.getVariableRef(ref)
    return ref in window.desech.variables.data
  },

  checkVarByName (name) {
    for (const variable of Object.values(window.desech.variables.data)) {
      if (variable.name === name) return true
    }
    return false
  }
}
