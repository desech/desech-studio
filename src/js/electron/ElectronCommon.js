import HelperError from '../helper/HelperError.js'

export default {
  handleEvent (obj, method, ...args) {
    try {
      if (!Object.prototype.hasOwnProperty.call(obj, method)) {
        throw new Error(`${method} method doesn't exist`)
      }
      return obj[method](...args)
    } catch (error) {
      HelperError.error(error)
    }
  }
}
