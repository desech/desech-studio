import { app } from 'electron'
import crypto from 'crypto'
import AdmZip from 'adm-zip'
import File from './File.js'

export default {
  unzipFileTmp (file) {
    const rand = crypto.randomBytes(32).toString('hex')
    const folder = File.resolve(app.getPath('temp'), rand)
    this.unzip(file, folder)
    return folder
  },

  unzip (file, folder) {
    const zip = new AdmZip(file)
    zip.extractAllTo(folder, true)
  },

  unzipInstanceTmp (zip) {
    const rand = crypto.randomBytes(32).toString('hex')
    const folder = File.resolve(app.getPath('temp'), rand)
    zip.extractAllTo(folder, true)
    return folder
  }
}
