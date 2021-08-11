import fs from 'fs'
import jimp from 'jimp'
import ImportCommon from './ImportCommon.js'
import File from '../file/File.js'
import EventMain from '../event/EventMain.js'
import Language from '../lib/Language.js'

export default {
  getImageName (string, id, images) {
    let name = ImportCommon.sanitizeName(string)
    if (images[name] || ['background', 'image', 'arrow-down'].includes(name)) {
      name += '-' + ImportCommon.sanitizeName(id)
    }
    images[name] = true
    return name
  },

  getSvgName (node, images) {
    let name = ImportCommon.sanitizeName(node.name)
    if (images[name]) name += '-' + node.width + '-' + node.height
    if (images[name]) name += '-' + ImportCommon.sanitizeName(node.id)
    images[name] = true
    return name
  },

  async processLocalImages (image, data, settings) {
    const id = this.getLocalImageId(image.file)
    const fileName = this.getImageName(data.name, id, settings.allImages)
    const src = File.resolve(settings.importFolder, image.file)
    const imgName = fileName + '.' + image.ext
    const msg = Language.localize('Processing image <b>{{imgName}}</b>', { imgName })
    EventMain.ipcMainInvoke('mainImportProgress', msg, settings.type)
    return await this.copyResizeImages(src, settings.folder, fileName, image, data)
  },

  getLocalImageId (imagePath) {
    const fileName = File.basename(imagePath)
    return (fileName.indexOf('.') > 0) ? fileName.substring(0, fileName.indexOf('.')) : fileName
  },

  async copyResizeImages (src, projectFolder, fileName, image, data) {
    const dest = await this.copyResizeImage(src, projectFolder, fileName, image.ext, image.width)
    await this.copyResizeImage(src, projectFolder, fileName + '@2x', image.ext, image.width * 2)
    await this.copyResizeImage(src, projectFolder, fileName + '@3x', image.ext, image.width * 3)
    return dest
  },

  async copyResizeImage (src, projectFolder, name, ext, width) {
    const dest = File.resolve(projectFolder, 'asset/image/' + name + '.' + ext)
    if (fs.existsSync(dest)) return dest
    const image = await jimp.read(src)
    await image.resize(width, jimp.AUTO)
    await image.writeAsync(dest)
    return dest
  }
}
