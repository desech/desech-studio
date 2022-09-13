import { ipcMain } from 'electron'
import EventMain from './EventMain.js'
import FigmaApi from '../import/figma/FigmaApi.js'

export default {
  addEvents () {
    this.rendererFetchFigmaEvent()
  },

  rendererFetchFigmaEvent () {
    ipcMain.handle('rendererFetchFigma', async (event) => {
      return await EventMain.handleEvent(FigmaApi, 'fetchToken')
    })
  }
}
