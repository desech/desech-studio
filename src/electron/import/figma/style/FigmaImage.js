import fs from 'fs'
import FigmaApi from '../FigmaApi.js'
import Language from '../../../lib/Language.js'
import FigmaCommon from '../FigmaCommon.js'
import File from '../../../file/File.js'
import ImportImage from '../../ImportImage.js'
import Fetch from '../../../lib/Fetch.js'

export default {
  async fetchImage (node, settings) {
    const fileName = ImportImage.getImageName(node.name, node.id, settings.allImages)
    const data = await this.getImageFile(fileName, 1, node, settings)
    await this.getImageFile(fileName + '@2x', 2, node, settings)
    await this.getImageFile(fileName + '@3x', 3, node, settings)
    return data.file
  },

  async getImageFile (file, scale, node, settings) {
    return await this.processImageFile({
      ...settings, // type, folder, file, token, settings, allImages
      elementId: node.id,
      image: {
        file,
        ext: 'png',
        scale,
        path: File.resolve(settings.folder, 'asset/image', file + '.png')
      }
    })
  },

  // this includes bitmap and vectors
  async processImageFile (data) {
    if (!fs.existsSync(data.image.path)) {
      await this.downloadImageFile(data)
    }
    return {
      file: data.image.path,
      content: (data.image.ext === 'svg')
        ? fs.readFileSync(data.image.path).toString()
        : undefined
    }
  },

  async downloadImageFile (data) {
    const url = `images/${data.file}?ids=${data.elementId}&scale=${data.image.scale}` +
      `&format=${data.image.ext}`
    const json = await FigmaApi.apiCall(url, data.token)
    if (!json.images[data.elementId]) {
      this.saveEmptyImage(data.image.path)
    } else {
      await this.saveApiImage(json.images[data.elementId], data.image.path, data.image.ext)
    }
  },

  saveEmptyImage (file) {
    FigmaCommon.sendProgress(Language.localize('<span class="error">Image is empty</span>'))
    // save the empty image so we don't call the api url again
    fs.writeFileSync(file, '')
  },

  async saveApiImage (url, file, ext) {
    const type = (ext === 'svg') ? 'text' : 'buffer'
    const content = await Fetch.fetch(url, type)
    fs.writeFileSync(file, content)
  }
}
