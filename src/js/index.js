import HelperError from './helper/HelperError.js'
import PageEvent from './page/PageEvent.js'
import ElectronEvent from './electron/ElectronEvent.js'
import Page from './page/Page.js'

document.addEventListener('DOMContentLoaded', () => {
  try {
    ElectronEvent.addEvents()
    PageEvent.addEvents()
    Page.loadStart()
    Page.setIntervals()
  } catch (error) {
    HelperError.error(error)
  }
})
