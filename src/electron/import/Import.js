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
import ImportFile from './ImportFile.js'
import ExtendJS from '../../js/helper/ExtendJS.js'
import ImportFont from './ImportFont.js'
import ProjectCommon from '../project/ProjectCommon.js'

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

  // params = type, folder, file, token, settings
  // we also add later: svgImageNames, fonts
  async importFile (params) {
    // @todo closing the import dialog should stop the import process
    params.svgImageNames = []
    EventMain.ipcMainInvoke('mainImportProgress', Language.localize('Parsing started'),
      params.type)
    const data = await this.getImportData(params)
    this.backupImportFile(data, params)
    if (ExtendJS.isEmpty(data)) {
      const msg = Language.localize('<span class="error">There are no valid top level visible elements to be imported</span>')
      EventMain.ipcMainInvoke('mainImportProgress', msg, params.type, params.folder)
      return
    }
    await this.processImportData(data, params)
    EventMain.ipcMainInvoke('mainImportProgress', Language.localize('Import finished'),
      params.type, params.folder)
  },

  async processImportData (data, params) {
    ImportFile.cleanFiles(data)
    this.saveViewportDimensions(data, params)
    params.fonts = await ImportFont.installFonts(data, params)
    await ImportFile.saveAllHtmlCssFiles(data, params)
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

  backupImportFile (data, params) {
    const file = File.resolve(params.folder, '_desech', params.type + '-import.json')
    fs.writeFileSync(file, JSON.stringify(data, null, 2))
  },

  saveViewportDimensions (data, params) {
    const file = this.getIndexFile(data)
    params.settings.responsive.default.width = Math.round(file.width) + 'px'
    params.settings.responsive.default.height = Math.round(file.height) + 'px'
    ProjectCommon.saveProjectSettings(params.folder, params.settings)
  },

  getIndexFile (data) {
    for (const entry of Object.values(data)) {
      if (entry.type === 'file' && entry.name === 'index') {
        return entry
      }
    }
    throw new Error('Index file not found')
  }
}
