import HelperCanvas from '../helper/HelperCanvas.js'
import HelperTrigger from '../helper/HelperTrigger.js'

export default {
  getRef () {
    const data = HelperCanvas.getCanvasData()
    return data?.selectedVariable
  },

  selectVariable (ref) {
    HelperCanvas.setCanvasData('selectedVariable', ref)
  },

  deselectVariable () {
    HelperCanvas.deleteCanvasData('selectedVariable')
    HelperTrigger.triggerReload('right-panel')
  }
}
