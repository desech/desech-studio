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
    window.desech.variables[data.variableName] = {
      name: data.propertyName,
      value: data.propertyValue
    }
  },

  removeVariable (name) {
    delete window.desech.variables[name]
  }
}
