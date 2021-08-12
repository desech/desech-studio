import { app } from 'electron'
import fs from 'fs'
import crypto from 'crypto'
import archiver from 'archiver'
import AdmZip from 'adm-zip'
import File from './File.js'

export default {
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
  },

  async exportProjectFolder (zipFolder, currentFolder) {
    const timestamp = Math.floor(Date.now() / 1000)
    const zipFile = `${File.basename(currentFolder)}-${timestamp}.zip`
    const zipPath = File.resolve(zipFolder, zipFile)
    await this.createProjectZip(zipPath, currentFolder)
  },

  createProjectZip (zipFile, folder, options = {}) {
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
        return this.ignoreExportPath(file.name) ? false : file
      })
      archive.finalize()
    })
  },

  ignoreExportPath (file) {
    // skip the zip files, the export folder, the cache folder and the import json file
    return file.endsWith('.zip') || file.startsWith('_export') ||
      file.startsWith('_desech/cache') || file.endsWith('-import.json')
  }
}
