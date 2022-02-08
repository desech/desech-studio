import File from '../file/File.js'

export default {
  getVariables (folder) {
    const json = File.getFileData('_desech/variable.json', folder)
    return json || { data: {}, tree: {} }
  },

  async saveVariables (variables, folder) {
    const file = File.resolve(folder, '_desech/variable.json')
    const contents = JSON.stringify(variables, null, 2)
    await File.saveFileWithBackup(file, contents)
  }
}
