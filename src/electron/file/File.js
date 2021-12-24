import fs from 'fs'
import os from 'os'
import crypto from 'crypto'
import path from 'path'
import { app, shell } from 'electron'
import HelperFile from '../../js/helper/HelperFile.js'

export default {
  extname (file, returnWithoutDot = false) {
    const ext = path.extname(file)
    return returnWithoutDot ? ext.substring(1) : ext
  },

  resolve () {
    return this.sanitizePath(Array.from(arguments).join('/').replace('//', '/'))
  },

  normalize () {
    const file = this.resolve(...arguments)
    return this.sanitizePath(path.normalize(file))
  },

  basename (file, ext = '') {
    return this.sanitizePath(path.basename(file, ext))
  },

  dirname (file) {
    return this.sanitizePath(path.dirname(file))
  },

  relative (from, to) {
    return this.sanitizePath(path.relative(path.resolve(from), path.resolve(to)))
  },

  isDir (file) {
    return fs.lstatSync(file).isDirectory()
  },

  sanitizePath (absPath) {
    // fix windows separator
    return absPath.replaceAll(path.sep, '/')
  },

  readFolder (folder, options = {}) {
    options = this.getReadFolderOptions(options)
    const results = []
    const entries = fs.readdirSync(folder, { withFileTypes: options.withFileTypes })
    for (const file of entries) {
      const fileName = options.withFileTypes ? file.name : file
      if (options.ignoreFiles.length && options.ignoreFiles.includes(fileName)) continue
      results.push(this.readFolderEntry(file, folder, options))
    }
    return options.sort ? this.sortReadFolder(results) : results
  },

  getReadFolderOptions (options) {
    return {
      withFileTypes: true,
      sort: false,
      ignoreFiles: [],
      ...options
    }
  },

  readFolderEntry (file, folder, options) {
    const fileName = options.withFileTypes ? file.name : file
    const absPath = this.resolve(folder, fileName)
    const isDir = options.withFileTypes ? file.isDirectory() : this.isDir(absPath)
    return {
      name: fileName,
      path: this.sanitizePath(absPath),
      type: isDir ? 'folder' : 'file',
      extension: isDir ? '' : this.extname(fileName).substring(1),
      children: isDir ? this.readFolder(absPath, options) : []
    }
  },

  readFileEntry (filePath) {
    return {
      name: this.basename(filePath),
      path: this.sanitizePath(filePath),
      type: 'file',
      extension: this.extname(filePath).substring(1)
    }
  },

  sortReadFolder (results) {
    return results.sort((a, b) => {
      const aScore = ((a.type === 'folder') ? 0 : 10) +
        (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0)
      const bScore = ((b.type === 'folder') ? 0 : 10) +
        (b.name.toLowerCase() > a.name.toLowerCase() ? 1 : 0)
      return aScore < bScore ? -1 : (aScore > bScore ? 1 : 0)
    })
  },

  createFolder (root, folder = null) {
    const dirPath = folder ? this.resolve(root, folder) : root
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath)
    return dirPath
  },

  copyFileIfMissing (data) {
    const name = data.name || this.basename(data.file)
    const newPath = this.resolve(data.root, name)
    if (!fs.existsSync(newPath)) fs.copyFileSync(data.file, newPath)
  },

  createFileIfMissing (file, content = '') {
    this.createMissingDir(this.dirname(file))
    if (!fs.existsSync(file)) fs.writeFileSync(file, content)
  },

  createFile (file, content = '') {
    this.createMissingDir(this.dirname(file))
    fs.writeFileSync(file, content)
  },

  createMissingDir (dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  },

  renamePath (file, name) {
    if (!fs.existsSync(file)) return
    const newPath = this.resolve(this.dirname(file), name)
    if (fs.existsSync(newPath)) return
    fs.renameSync(file, newPath)
    return newPath
  },

  async sendToTrash (file) {
    if (fs.existsSync(file)) {
      file = HelperFile.convertPathForWin(file, os.platform())
      await shell.trashItem(file)
    }
  },

  async syncUiFolder (destFolder) {
    const ui = this.sanitizePath(this.resolve(app.getAppPath(), 'ui'))
    // `withFileTypes` doesn't work with asar
    const files = this.readFolder(ui, { withFileTypes: false })
    // we always want to update the animation.css and reset.css files
    const checkSameFiles = [
      this.resolve(ui, 'css/general/animation.css'),
      this.resolve(ui, 'css/general/reset.css')
    ]
    await this.syncFolder(files, ui, destFolder, { checkSameFiles })
  },

  // options = { checkSame: true/false, checkSameFiles: ['/var/file.txt'],
  //            ignoreFiles: ['/var/file.txt'] }
  async syncFolder (files, srcFolder, destFolder, options = {}) {
    for (const file of files) {
      if (options.ignoreFiles && options.ignoreFiles.includes(file.path)) continue
      await this.syncFile(file, srcFolder, destFolder, options)
    }
  },

  async syncFile (file, srcFolder, destFolder, options) {
    const destFile = file.path.replace(srcFolder, destFolder)
    if (file.type === 'folder' && !fs.existsSync(destFile)) {
      fs.mkdirSync(destFile)
    } else if (file.type === 'file' && (!fs.existsSync(destFile) ||
      ((options.checkSame ||
        (options.checkSameFiles && options.checkSameFiles.includes(file.path))) &&
        !await this.areFilesIdentical(file.path, destFile)))) {
      // overwrite the file if the file doesn't exist
      // or if checkSame is true, and the file is not identical
      // or if the file is found in the checkSameFiles array, and the file is not identical
      this.createMissingDir(this.dirname(destFile))
      fs.copyFileSync(file.path, destFile)
    }
    if (file.children) {
      await this.syncFolder(file.children, srcFolder, destFolder, options)
    }
  },

  async areFilesIdentical (file1, file2) {
    const hash1 = await this.getFileHash(file1)
    const hash2 = await this.getFileHash(file2)
    return (hash1 === hash2)
  },

  getFileHash (file) {
    return new Promise((resolve, reject) => {
      try {
        const hash = crypto.createHash('sha256')
        const input = fs.createReadStream(file)
        input.on('readable', () => {
          const data = input.read()
          if (data) {
            hash.update(data)
          } else {
            return resolve(hash.digest('hex'))
          }
        }).on('error', error => {
          reject(error)
        })
      } catch (error) {
        reject(error)
      }
    })
  },

  getContentTypeExtension (type) {
    switch (type) {
      case 'image/jpeg':
        return 'jpg'
      case 'image/png':
        return 'png'
      case 'image/gif':
        return 'gif'
      default:
        throw new Error(`Unknown image type ${type}`)
    }
  },

  getFileData (file, folder = null) {
    if (folder) file = this.resolve(folder, file)
    const string = this.readFile(file)
    return JSON.parse(string)
  },

  readFile (file) {
    return fs.readFileSync(file).toString()
  },

  deletePath (file) {
    if (fs.existsSync(file)) fs.rmSync(file, { force: true, recursive: true })
  }
}
