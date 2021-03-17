import HelperError from '../helper/HelperError.js'

export default {
  addEvents () {
    this.mainErrorEvent()
  },

  mainErrorEvent () {
    window.electron.on('mainError', (event, error) => {
      HelperError.error(error)
    })
  }
}
