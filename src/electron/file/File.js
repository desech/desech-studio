import fs from 'fs'
import crypto from 'crypto'
import path from 'path'
import { app } from 'electron'
import Zip from './Zip.js'

export default {
  extname (file) {
    return path.extname(file)
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
    const isDir = options.withFileTypes ? file.isDirectory() : fs.lstatSync(absPath).isDirectory()
    return {
      name: fileName,
      path: this.sanitizePath(absPath),
      type: isDir ? 'folder' : 'file',
      extension: isDir ? '' : this.extname(fileName).substring(1),
      children: isDir ? this.readFolder(absPath, options) : []
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

  moveToFolder (from, to) {
    const newPath = this.resolve(to, this.basename(from))
    fs.renameSync(from, newPath)
    return newPath
  },

  createFolder (root, folder = null) {
    const dirPath = folder ? this.resolve(root, folder) : root
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath)
    return dirPath
  },

  copyFileIfMissing (data) {
    const newPath = this.resolve(data.root, this.basename(data.file))
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
    fs.renameSync(file, newPath)
    return newPath
  },

  async syncUiFolder (destFolder) {
    const ui = this.sanitizePath(this.resolve(app.getAppPath(), 'ui'))
    // `withFileTypes` doesn't work with asar
    const files = this.readFolder(ui, { withFileTypes: false })
    await this.syncFolder(files, ui, destFolder)
  },

  async syncFolder (files, srcFolder, destFolder, checkIdentical = false) {
    for (const file of files) {
      await this.syncFile(file, srcFolder, destFolder, checkIdentical)
    }
  },

  async syncFile (file, srcFolder, destFolder, checkIdentical = false) {
    const destFile = file.path.replace(srcFolder, destFolder)
    if (file.type === 'folder' && !fs.existsSync(destFile)) {
      fs.mkdirSync(destFile)
    } else if (file.type === 'file' && (!fs.existsSync(destFile) ||
      (checkIdentical && !await this.areFilesIdentical(file.path, destFile)))) {
      fs.copyFileSync(file.path, destFile)
    }
    if (file.children) await this.syncFolder(file.children, srcFolder, destFolder)
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

  async exportFolder (zipFolder, currentFolder) {
    const zipFile = this.resolve(zipFolder, this.getZipFile(currentFolder))
    await Zip.createZip(zipFile, currentFolder)
  },

  getZipFile (folder) {
    const timestamp = Math.floor(Date.now() / 1000)
    return `${this.basename(folder)}-${timestamp}.zip`
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
    const string = fs.readFileSync(file).toString()
    return JSON.parse(string)
  }
}
