import HelperCanvas from '../helper/HelperCanvas.js'
import HelperTrigger from '../helper/HelperTrigger.js'
import HelperGlobal from '../helper/HelperGlobal.js'

export default {
  getRef () {
    const data = HelperCanvas.getCanvasData()
    return data?.selectedVariable
  },

  getVariable (ref = null) {
    if (!ref) ref = this.getRef()
    const data = HelperGlobal.getVariables().data[ref]
    return { ref, ...data }
  },

  selectVariable (ref) {
    HelperCanvas.setCanvasData('selectedVariable', ref)
  },

  deselectVariable () {
    HelperCanvas.deleteCanvasData('selectedVariable')
    HelperTrigger.triggerReload('right-panel')
  }
}
