import { app } from 'electron'
import fs from 'fs'
import crypto from 'crypto'
import archiver from 'archiver'
import AdmZip from 'adm-zip'
import File from './File.js'

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
      archive.directory(folder, options.includeFolder ? File.basename(folder) : false)
      archive.finalize()
    })
  },

  unzip (file, folder) {
    const zip = new AdmZip(file)
    zip.extractAllTo(folder, true)
  },

  unzipFileTmp (file) {
    const rand = crypto.randomBytes(32).toString('hex')
    const folder = File.resolve(app.getPath('temp'), rand)
    this.unzip(file, folder)
    return folder
  },

  unzipInstanceTmp (zip) {
    const rand = crypto.randomBytes(32).toString('hex')
    const folder = File.resolve(app.getPath('temp'), rand)
    zip.extractAllTo(folder, true)
    return folder
  }
}
