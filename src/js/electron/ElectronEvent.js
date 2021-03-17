import ElectronMainError from './ElectronMainError.js'
import ElectronMenu from './ElectronMenu.js'
import ElectronStart from './ElectronStart.js'
import ElectronMisc from './ElectronMisc.js'

export default {
  addEvents () {
    ElectronMainError.addEvents()
    ElectronMenu.addEvents()
    ElectronStart.addEvents()
    ElectronMisc.addEvents()
  }
}
