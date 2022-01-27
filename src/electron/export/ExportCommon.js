import fs from 'fs'
import File from '../file/File.js'

export default {
  getGeneralCssFiles () {
    // order matters
    return [
      'css/general/reset.css',
      'css/general/animation.css',
      'css/general/font.css',
      'css/general/design-system.css',
      'css/general/root.css',
      'css/general/component-css.css',
      'css/general/component-html.css'
    ]
  },

  getGeneralJsFiles () {
    return ['js/script.js']
  },

  getCompiledCss (folder) {
    const part1 = this.getPart1Files(folder)
    const designSystem = this.getDesignSystemCss(folder)
    const part2 = this.getPart2Files(folder)
    const page = this.getCssContent(this.getPageCssFiles(folder))
    const animation = this.getAnimationCss(folder, part1 + part2 + page)
    return [part1, animation, designSystem, part2, page].join('\n')
  },

  getPart1Files (folder) {
    const files = this.getFilePaths([
      'css/general/reset.css',
      // here should be the animation file, but we add it after the font css file, which is fine
      'css/general/font.css'
    ], folder)
    return this.getCssContent(files)
  },

  getPart2Files (folder) {
    const files = this.getFilePaths([
      'css/general/root.css',
      'css/general/component-css.css',
      'css/general/component-html.css'
    ], folder)
    return this.getCssContent(files)
  },

  getFilePaths (files, folder, ignore = []) {
    const paths = []
    for (const file of files) {
      if (ignore && ignore.includes(file)) continue
      const filePath = File.resolve(folder, file)
      if (fs.existsSync(filePath)) paths.push(filePath)
    }
    return paths
  },

  getCssContent (files) {
    let css = ''
    for (const file of files) {
      css += css ? '\n' : ''
      css += File.readFile(file)
    }
    return this.cleanUpCss(css)
  },

  cleanUpCss (css) {
    // remove empty classes that have no style
    return css.replace(/.*? {\n}/g, '')
  },

  getDesignSystemCss (folder) {
    const file = File.resolve(folder, 'css/general/design-system.css')
    return fs.existsSync(file) ? File.readFile(file) : ''
  },

  getPageCssFiles (folder) {
    const paths = []
    const files = File.readFolder(File.resolve(folder, 'css/page'))
    for (const file of files) {
      if (file.extension === 'css') paths.push(file.path)
    }
    return paths
  },

  getAnimationCss (folder, css) {
    let selectedCss = ''
    const animations = this.getAnimationsUsed(css)
    if (!animations.length) return ''
    const file = File.resolve(folder, 'css/general/animation.css')
    const animationCss = File.readFile(file) + '@'
    for (const animation of animations) {
      const regex = new RegExp(`(@keyframes ${animation} [\\s\\S]*?}[\\s]*)@`, 'g')
      const match = regex.exec(animationCss)
      if (match) selectedCss += match[1]
    }
    return selectedCss
  },

  getAnimationsUsed (css) {
    const list = []
    const regex = css.matchAll(/animation:(.*?);/g)
    for (const match of regex) {
      const value = match[1].substring(match[1].lastIndexOf(' ') + 1)
      list.push(value)
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
      if (file.path.startsWith(File.resolve(folder, 'component'))) {
        file.isComponent = true
      }
      list.push(file)
    }
  },

  checkAllowedHtmlFolder (name) {
    const ignore = ['asset', 'css', 'font', 'js', '_desech', '_export', '.git']
    for (const val of ignore) {
      if (name === val) return false
    }
    return true
  },

  getRootMiscFiles (folder, htmlFiles) {
    const list = []
    const files = File.readFolder(folder)
    for (const file of files) {
      // we don't look inside children, only at the top root folder
      if (this.isRootMiscFolder(file, htmlFiles) ||
        (file.type === 'file' && file.extension !== 'html')) {
        list.push(file)
      }
    }
    return list
  },

  isRootMiscFolder (file, htmlFiles) {
    if (file.type !== 'folder') return false
    return ['asset', 'font'].includes(file.name) ||
      (!['css', 'js', '_desech', '_export', '.git', 'component'].includes(file.name) &&
      !this.isHtmlRootFolder(file.path, htmlFiles))
  },

  isHtmlRootFolder (filePath, htmlFiles) {
    for (const htmlFile of htmlFiles) {
      if (htmlFile.path.startsWith(filePath)) return true
    }
    return false
  }
}
