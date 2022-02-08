import HelperError from './helper/HelperError.js'
import PageEvent from './page/PageEvent.js'
import ElectronEvent from './electron/ElectronEvent.js'
import Page from './page/Page.js'
import Auth from './start/Auth.js'
import HelperGlobal from './helper/HelperGlobal.js'

document.addEventListener('DOMContentLoaded', async () => {
  try {
    HelperGlobal.initGlobal()
    ElectronEvent.addEvents()
    PageEvent.addEvents()
    Page.loadStart()
    await Auth.loadAuth()
    Page.setIntervals()
  } catch (error) {
    HelperError.error(error)
  }
})
