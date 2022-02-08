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
      set: data.propertySet,
      value: data.propertyValue
    }
  },

  removeVariable (name) {
    delete window.desech.variables[name]
  },

  variableExists (name) {
    return this.getVariableName(name) in window.desech.variables
  },

  // the name can be in this format `var(--name)`
  getVariableName (name) {
    if (/var\(--(.*?)\)/g.test(name)) {
      return /var\(--(.*?)\)/g.exec(name)[1]
    } else {
      return name
    }
  }
}
