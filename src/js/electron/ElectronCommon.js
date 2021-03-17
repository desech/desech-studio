import HelperError from '../helper/HelperError.js'

export default {
  handleEvent (obj, method, ...args) {
    try {
      return obj[method](...args)
    } catch (error) {
      HelperError.error(error)
    }
  }
}
