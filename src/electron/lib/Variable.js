import fs from 'fs'
import File from '../file/File.js'

export default {
  validateVariable (name, folder) {
    const variables = this.getVariables(folder)
    return !(name in variables)
  },

  createVariable (data, folder) {
    const variables = this.getVariables(folder)
    variables[data.variableName] = {
      name: data.propertyName,
      value: data.propertyValue
    }
    this.saveVariables(variables, folder)
  },

  getVariables (folder) {
    const data = File.getFileData('_desech/variable.json', folder)
    return data || {}
  },

  saveVariables (variables, folder) {
    const file = File.resolve(folder, '_desech/variable.json')
    fs.writeFileSync(file, JSON.stringify(variables, null, 2))
  },

  deleteVariable (data, folder) {
    const variables = this.getVariables(folder)
    delete variables[data.variableName]
    this.saveVariables(variables, folder)
  }
}
