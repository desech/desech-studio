import HelperGlobal from '../../../helper/HelperGlobal.js'
import ExtendJS from '../../../helper/ExtendJS.js'

export default {
  getVariables () {
    const array = []
    for (const [ref, variable] of Object.entries(HelperGlobal.getVariables().data)) {
      array.push({ ref, ...variable })
    }
    return ExtendJS.sortArrayByObjKey(array, 'name')
  }
}
