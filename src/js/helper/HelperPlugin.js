export default {
  getPluginName (url) {
    return url.replace('https://github.com/', '').replace('/', '-')
  }
}
