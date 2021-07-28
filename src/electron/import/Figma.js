import { shell } from 'electron'
import Config from '../lib/Config.js'
import Settings from '../lib/Settings.js'
import EventMain from '../event/EventMain.js'
import FigmaParse from './figma/FigmaParse.js'
import File from '../file/File.js'
import FigmaCommon from './figma/FigmaCommon.js'
import ParseCommon from './ParseCommon.js'
import Auth from '../main/Auth.js'

export default {
  async showImportFile () {
    const user = await this.getUserTokens()
    if (user && user.figma_token) {
      EventMain.ipcMainInvoke('mainShowFigmaImport', user.figma_token)
    } else {
      this.startAuth()
    }
  },

  async getUserTokens () {
    const url = Config.getConfig('api') + '/user/tokens-fetch?user=' +
      Settings.getSetting('userToken') + '&login=' + Settings.getSetting('loginToken')
    return await Auth.fetchData(url)
  },

  startAuth () {
    const url = Config.getConfig('api') + '/user/figma?user=' +
      Settings.getSetting('userToken') + '&login=' + Settings.getSetting('loginToken')
    shell.openExternal(url)
  },

  async fetchToken () {
    const user = await this.getUserTokens()
    if (user && user.figma_token) {
      EventMain.ipcMainInvoke('mainShowFigmaImport', user.figma_token)
    }
  },

  async getImportData (params) {
    const data = await FigmaCommon.apiCall(`files/${params.file}?geometry=paths`, params.token)
    const existingImages = await this.initExistingImages(params.folder)
    return await FigmaParse.parseFigma({
      existingImages,
      data,
      ...params
    })
  },

  async initExistingImages (folder) {
    await ParseCommon.prepareProjectFolder(folder)
    const imageFolder = File.resolve(folder, 'asset/image')
    const cacheFolder = File.resolve(folder, '_desech/cache')
    return [
      ...File.readFolder(imageFolder),
      ...File.readFolder(cacheFolder)
    ]
  }
}
