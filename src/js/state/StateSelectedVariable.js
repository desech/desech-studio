import HelperCanvas from '../helper/HelperCanvas.js'
import HelperTrigger from '../helper/HelperTrigger.js'
import HelperGlobal from '../helper/HelperGlobal.js'
import LeftCommon from '../main/left/LeftCommon.js'

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
    LeftCommon.selectItemByRef(ref)
    HelperTrigger.triggerReload('right-panel')
  },

  deselectVariable () {
    HelperCanvas.deleteCanvasData('selectedVariable')
    LeftCommon.deselectItem('variable')
    HelperTrigger.triggerReload('right-panel')
  }
}
