import Crypto from '../../electron/lib/Crypto.js'
import HelperGlobal from './HelperGlobal.js'

export default {
  // the ref can be in this format `var(--ref)`
  getVariableRef (ref) {
    if (/var\(--(.*?)\)/g.test(ref)) {
      return /var\(--(.*?)\)/g.exec(ref)[1]
    } else {
      return ref
    }
  },

  generateVariableRef () {
    return 'v0' + Crypto.generateMediumID()
  },

  getVariable (ref) {
    return HelperGlobal.getVariables().data[ref]
  }
}
