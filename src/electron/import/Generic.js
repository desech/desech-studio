import { dialog } from 'electron'
import Settings from '../lib/Settings.js'
import Language from '../lib/Language.js'
import File from '../file/File.js'
import Import from './Import.js'
import Electron from '../lib/Electron.js'

export default {
  async importFile (type) {
    const locale = Settings.getSetting('locale')
    const files = this.getChooseFile(locale)
    if (!files) return
    const file = File.sanitizePath(files[0])
    await Import.importFile({ type, file, locale })
  },

  getChooseFile (locale) {
    return dialog.showOpenDialogSync(Electron.getCurrentWindow(), {
      title: Language.localize('Choose an import file', locale),
      buttonLabel: Language.localize('Choose file', locale)
    })
  }
}
