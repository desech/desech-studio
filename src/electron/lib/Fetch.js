import electron from 'electron'
import fetch from 'node-fetch'
import Language from './Language.js'

export default {
  // type can be: text, json, buffer
  async fetch (url, type = 'json', options = {}) {
    this.addUserAgent(options)
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(Language.localize("Can't access {{url}}", { url }))
    const data = await response[type]()
    if (type === 'json') this.validateJsonErrors(data, url, response)
    return data
  },

  addUserAgent (options) {
    if (!options?.headers) options.headers = {}
    if (!options.headers['User-Agent']) {
      options.headers['User-Agent'] = this.getDefaultUserAgent()
    }
  },

  getDefaultUserAgent () {
    const env = electron.app?.isPackaged ? 'Live' : 'Dev'
    return 'Desech Studio ' + env
  },

  validateJsonErrors (data, url, response) {
    if (data.error) this.error(data.error, url, response)
    if (data.err) this.error(data.err, url, response)
  },

  error (error, url, response) {
    const msg = Language.localize('Error: {{error}}, Status: {{status}}, Url: {{url}}', {
      url,
      status: response.status,
      error
    })
    throw new Error(msg)
  }
}
