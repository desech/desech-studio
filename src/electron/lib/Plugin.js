import { app } from 'electron'
import AdmZip from 'adm-zip'
import archiver from 'archiver'
import fse from 'fs-extra'
import jimp from 'jimp'
import beautify from 'js-beautify'
import jsdom from 'jsdom'
import fetch from 'node-fetch'
import fs from 'fs'
import File from '../file/File.js'
import ProjectCommon from '../project/ProjectCommon.js'
import HelperPlugin from '../../js/helper/HelperPlugin.js'
import Unzip from '../file/Unzip.js'
import Electron from './Electron.js'
import Language from './Language.js'
import Log from './Log.js'
import Fetch from './Fetch.js'
import ExtendJS from '../../js/helper/ExtendJS.js'
import packageJson from '../../../package.json' assert { type: 'json' }

export default {
  _DIR: null,

  async initPlugins () {
    // this is async, but will not be called as such, because we want it to be run in parallel
    try {
      this.setDir()
      await this.updatePlugins()
    } catch (error) {
      await Log.error(error)
    }
  },

  setDir () {
    this._DIR = File.resolve(app.getPath('userData'), 'plugin')
    File.createFolder(this._DIR)
  },

  async updatePlugins () {
    const plugins = this.getInstalledPlugins()
    for (const plugin of plugins) {
      await this.updatePlugin(plugin)
    }
  },

  async updatePlugin (plugin) {
    if (!this.canUpdate(plugin)) return
    const data = await this.fetchPluginData(plugin.url)
    if (plugin.version === data.version) return
    await this.copyPlugin(plugin.url)
  },

  canUpdate (data) {
    // @todo remove the `autoupdate` lowercase check in April (added on 1 Feb)
    return (data.autoupdate || data.autoUpdate) &&
      (!data.requires || ExtendJS.versionCompare(packageJson.version, data.requires) >= 0)
  },

  async fetchPluginData (repoUrl) {
    const url = repoUrl.replace('github.com', 'raw.githubusercontent.com') +
      '/main/package.json'
    return await Fetch.fetch(url)
  },

  async installPlugin (url) {
    await this.copyPlugin(url)
    Electron.reload()
  },

  async copyPlugin (url) {
    const folder = await this.unzipTemp(url)
    const data = this.getFolderPluginData(folder)
    if (!data) {
      throw new Error(Language.localize('No package.json data found for {{url}}', { url }))
    }
    await this.moveTmpFolder(folder, url)
  },

  async unzipTemp (url) {
    const buffer = await this.getApiZip(url)
    const zip = new AdmZip(buffer)
    const folder = Unzip.unzipInstanceTmp(zip)
    // we want the subfolder
    return File.resolve(folder, fs.readdirSync(folder)[0])
  },

  async getApiZip (url) {
    // const apiUrl = url.replace('github.com', 'api.github.com/repos') + '/zipball'
    url += '/archive/refs/heads/main.zip'
    return await Fetch.fetch(url, 'buffer')
  },

  getFolderPluginData (folder) {
    for (const file of fs.readdirSync(folder)) {
      if (file !== 'package.json') continue
      const data = File.getFileData(file, folder)
      return data.desech
    }
  },

  async moveTmpFolder (folder, url) {
    const pluginName = HelperPlugin.getPluginName(url)
    const dest = File.resolve(this._DIR, pluginName)
    await File.sendToTrash(dest)
    fse.copySync(folder, dest)
  },

  async getAllPlugins () {
    this.setDir()
    const list = await this.getPluginsList()
    const installed = this.getInstalledPlugins()
    for (const plugin of list) {
      for (let i = 0; i < installed.length; i++) {
        if (plugin.url === installed[i].url) {
          plugin.installed = true
          installed.splice(i, 1)
          break
        }
      }
    }
    return [...list, ...installed]
  },

  async getPluginsList () {
    const url = 'https://raw.githubusercontent.com/desech/studio-plugins/main/plugins.json'
    const json = await Fetch.fetch(url)
    return json.plugins
  },

  getInstalledPlugins () {
    const list = []
    const files = fs.readdirSync(this._DIR, { withFileTypes: true })
    for (const entry of files) {
      const data = this.getInstalledPluginData(entry)
      if (data) list.push(data)
    }
    return list
  },

  getInstalledPluginData (entry) {
    if (!entry.isDirectory()) return
    const folder = File.resolve(this._DIR, entry.name)
    if (!fs.existsSync(File.resolve(folder, 'package.json'))) return
    const data = File.getFileData('package.json', folder)
    if (!data.desech) return
    return {
      ...data.desech,
      version: data.version,
      installed: true,
      folder
    }
  },

  async removePlugin (url) {
    const pluginName = HelperPlugin.getPluginName(url)
    const pluginPath = File.resolve(this._DIR, pluginName)
    await File.sendToTrash(pluginPath)
    Electron.reload()
  },

  async triggerPlugin (category, method, data = null) {
    const project = await ProjectCommon.getProjectSettings()
    if (!project[category]) return
    const file = File.resolve(this._DIR, project[category], 'index.js')
    if (!fs.existsSync(file)) {
      throw new Error(Language.localize('Plugin {{plugin}} is not installed',
        { plugin: project[category] }))
    }
    const module = require(file)
    if (!(method in module)) {
      throw new Error(Language.localize('Unknown "{{method}}" method for active plugin ' +
        'category "{{category}}"', { method, category }))
    }
    return await module[method](data, this.getLibs())
  },

  getLibs () {
    return { AdmZip, archiver, fse, jimp, beautify, jsdom, fetch }
  }
}
