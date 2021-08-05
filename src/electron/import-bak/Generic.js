import { dialog } from 'electron'
import Language from '../lib/Language.js'
import File from '../file/File.js'
import Import from './Import.js'
import Electron from '../lib/Electron.js'

export default {
  async importFile (type) {
    const files = this.getChooseFile()
    if (!files) return
    const file = File.sanitizePath(files[0])
    await Import.importFile({ type, file })
  },

  getChooseFile () {
    return dialog.showOpenDialogSync(Electron.getCurrentWindow(), {
      title: Language.localize('Choose an import file'),
      buttonLabel: Language.localize('Import this file')
    })
  }
}
