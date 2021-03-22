import path from 'path'
import fs from 'fs'
import File from '../file/File.js'

export default {
  getCompiledCss (folder) {
    const general = this.getCssContent(this.getGeneralCssFiles(folder))
    const page = this.getCssContent(this.getPageCssFiles(folder))
    return general + '\n' + page
  },

  getGeneralCssFiles (folder) {
    const paths = []
    // order matters
    const files = ['reset', 'animation', 'font', 'design-system', 'root', 'component-css',
      'component-html']
    for (const file of files) {
      const filePath = path.resolve(folder, 'css/general', file + '.css')
      if (fs.existsSync(filePath)) paths.push(filePath)
    }
    return paths
  },

  getPageCssFiles (folder) {
    const paths = []
    const files = File.readFolder(path.resolve(folder, 'css/page'))
    for (const file of files) {
      if (file.extension === 'css') paths.push(file.path)
    }
    return paths
  },

  getCssContent (files) {
    let css = ''
    for (const file of files) {
      css += css ? '\n' : ''
      css += fs.readFileSync(file).toString()
    }
    return css
  },

  getRootMiscFiles (folder) {
    const list = []
    const files = File.readFolder(folder)
    for (const file of files) {
      if ((file.type === 'folder' && ['asset', 'font'].includes(file.name)) ||
        (file.type === 'file' && file.extension !== 'html')) {
        list.push(file)
      }
    }
    return list
  },

  getHtmlFiles (folder) {
    const files = File.readFolder(folder)
    const list = []
    this.addHtmlFolderFiles(files, folder, list)
    return list
  },

  addHtmlFolderFiles (files, folder, list) {
    for (const file of files) {
      if (file.type === 'folder' && !this.checkAllowedHtmlFolder(file.name)) continue
      if (file.type === 'folder') this.addHtmlFolderFiles(file.children, folder, list)
      if (file.extension !== 'html') continue
      if (file.path.startsWith(path.resolve(folder, 'component'))) {
        file.isComponent = true
      }
      list.push(file)
    }
  },

  checkAllowedHtmlFolder (name) {
    const ignore = ['asset', 'css', 'font', 'js', '_desech', '_export']
    for (const val of ignore) {
      if (name === val) return false
    }
    return true
  }
}
