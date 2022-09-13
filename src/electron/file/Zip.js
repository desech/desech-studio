import fs from 'fs'
import archiver from 'archiver'

export default {
  createZip (zipFile, folder, options = {}) {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipFile)
      const archive = archiver('zip')
      archive.on('end', () => {
        resolve()
      })
      archive.on('error', error => {
        reject(error)
      })
      archive.pipe(output)
      archive.directory(folder, false, file => {
        return this.ignoreFile(file.name, options) ? false : file
      })
      archive.finalize()
    })
  },

  ignoreFile (fileName, options) {
    return (options.ignorePathsFunc && options.ignorePathsFunc(fileName))
  }
}
