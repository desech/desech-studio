import fs from 'fs'
import { dialog } from 'electron'
import Electron from '../lib/Electron.js'
import Language from '../lib/Language.js'
import File from '../file/File.js'
import FigmaApi from './figma/FigmaApi.js'
import Figma from './figma/Figma.js'
import Sketch from './sketch/Sketch.js'
import Adobexd from './adobexd/Adobexd.js'
import EventMain from '../event/EventMain.js'

export default {
  async importChooseFile (type) {
    if (type === 'figma') {
      await FigmaApi.showImportFile()
    } else { // adobexd, sketch
      const files = this.getChooseFile()
      if (!files) return
      const file = File.sanitizePath(files[0])
      EventMain.ipcMainInvoke('mainNewProject', { type, file })
    }
  },

  getChooseFile () {
    return dialog.showOpenDialogSync(Electron.getCurrentWindow(), {
      title: Language.localize('Choose an import file'),
      buttonLabel: Language.localize('Import this file')
    })
  },

  // params = folder, type, file, token
  async importFile (params) {
    const data = await this.getImportData(params)
    this.backupImportFile(params, data)
    EventMain.ipcMainInvoke('mainImportProgress', Language.localize('Import finished'),
      params.type, params.folder)
  },

  async getImportData (params) {
    switch (params.type) {
      case 'figma':
        return await Figma.getImportData(params)
      case 'sketch':
        return await Sketch.getImportData(params)
      case 'adobexd':
        return await Adobexd.getImportData(params)
      default:
        throw new Error(`Unknown import type ${params.type}`)
    }
  },

  backupImportFile (params, data) {
    const file = File.resolve(params.folder, '_desech', params.type + '-import.json')
    fs.writeFileSync(file, JSON.stringify(data, null, 2))
  }
}
