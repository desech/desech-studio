import { dialog } from 'electron'
import Cookie from '../lib/Cookie.js'
import File from '../file/File.js'
import Zip from '../file/Zip.js'
import Electron from '../lib/Electron.js'
import Language from '../lib/Language.js'

export default {
  async exportFolder () {
    const currentFolder = await Cookie.getCookie('currentFolder')
    if (!currentFolder) return
    const zipFolder = await this.getZipFolder()
    if (!zipFolder) return
    await this.exportZipFolder(zipFolder, currentFolder, {
      ignorePathsFunc: file => {
        return file.endsWith('.zip') || file.startsWith('_export') ||
          file.startsWith('_desech/cache') || file.endsWith('-import.json')
      }
    })
  },

  async exportProduction () {
    const currentFolder = await Cookie.getCookie('currentFolder')
    if (!currentFolder) return
    const zipFolder = await this.getZipFolder()
    if (!zipFolder) return
    await this.exportZipFolder(zipFolder, File.resolve(currentFolder, '_export'))
  },

  async getZipFolder () {
    const folders = this.getExportFolder()
    if (folders) return File.sanitizePath(folders[0])
  },

  getExportFolder () {
    return dialog.showOpenDialogSync(Electron.getCurrentWindow(), {
      title: Language.localize('Save zip file'),
      buttonLabel: Language.localize('Save file'),
      properties: ['openDirectory', 'createDirectory']
    })
  },

  async exportZipFolder (zipFolder, currentFolder, options = {}) {
    const timestamp = Math.floor(Date.now() / 1000)
    const zipFile = `${File.basename(currentFolder)}-${timestamp}.zip`
    const zipPath = File.resolve(zipFolder, zipFile)
    await Zip.createZip(zipPath, currentFolder, options)
  }
}
