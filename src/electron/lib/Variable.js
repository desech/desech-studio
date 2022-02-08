import File from '../file/File.js'

export default {
  getVariables (folder) {
    const data = File.getFileData('_desech/variable.json', folder)
    return data || {}
  },

  async saveVariables (variables, folder) {
    const file = File.resolve(folder, '_desech/variable.json')
    const contents = JSON.stringify(variables, null, 2)
    await File.saveFileWithBackup(file, contents)
  }
}
