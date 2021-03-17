import config from '../../../config.json'

export default {
  getConfigData () {
    return config[process.env.NODE_ENV]
  },

  getConfig (name) {
    return this.getConfigData()[name]
  }
}
