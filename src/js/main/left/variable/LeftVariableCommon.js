import HelperGlobal from '../../../helper/HelperGlobal.js'
import ExtendJS from '../../../helper/ExtendJS.js'

export default {
  getVariables () {
    const array = []
    for (const [ref, variable] of Object.entries(HelperGlobal.getVariables().data)) {
      array.push({ ref, ...variable })
    }
    return this.sortVariables(array)
  },

  // sort by variable name, but move the colors in front
  sortVariables (array) {
    array = ExtendJS.sortArrayByObjKey(array, 'name')
    const colors = array.filter(val => val.type === 'color')
    const nonColors = array.filter(val => val.type !== 'color')
    return [...colors, ...nonColors]
  },

  getColors () {
    return this.getVariables().filter(val => val.type === 'color')
  }
}
