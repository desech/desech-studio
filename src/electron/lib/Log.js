import { app } from 'electron'
import fs from 'fs'
import os from 'os'
import path from 'path'
import crypto from 'crypto'
import Cookie from './Cookie.js'

export default {
  _FILE: 'app.log',
  _MAX_SIZE: 1024 * 1024 * 10, // 10 megabyte
  _MAX_EXTRA_FILES: 5,

  async initLogs () {
    const dir = path.resolve(app.getPath('userData'), 'log')
    app.setAppLogsPath(dir)
  },

  async setInstanceId () {
    const id = crypto.randomBytes(8).toString('hex')
    await Cookie.setCookie('instanceId', id)
  },

  getFolder () {
    if (app) {
      return app.getPath('logs') + '/'
    } else {
      return path.join(process.cwd(), '/build/logs/')
    }
  },

  getFile () {
    return this.getFolder() + this._FILE
  },

  async error (errorObj) {
    console.error(errorObj)
    await this.add(errorObj.stack, 'error')
  },

  async warn (errorObj) {
    console.warn(errorObj)
    await this.add(errorObj.stack, 'warn')
  },

  async info (value) {
    if (typeof value === 'object') value = JSON.stringify(value, null, 2)
    await this.add(value, 'info')
  },

  async add (text, type) {
    if (this.fileTooBig()) this.rotateFile()
    const line = await this.formatMessage(text, type)
    console.info(`Logging "${type}" to file "${this.getFile()}"`)
    fs.appendFileSync(this.getFile(), line)
  },

  fileTooBig () {
    return (fs.existsSync(this.getFile()) && fs.statSync(this.getFile()).size > this._MAX_SIZE)
  },

  rotateFile () {
    let index = fs.readdirSync(this.getFolder()).length
    if (index > this._MAX_EXTRA_FILES) {
      this.shiftFiles()
      index = this._MAX_EXTRA_FILES
    }
    // rename the current file
    fs.renameSync(this.getFile(), this.getExtraFile(index))
  },

  getExtraFile (index) {
    return this.getFolder() + this._FILE.replace('.', index + '.')
  },

  shiftFiles () {
    // remove the 1st file
    fs.unlinkSync(this.getExtraFile(1))
    for (let i = 2; i <= this._MAX_EXTRA_FILES; i++) {
      // shift the rest of the files
      fs.renameSync(this.getExtraFile(i), this.getExtraFile(i - 1))
    }
  },

  async formatMessage (text, type) {
    const id = await Cookie.getCookie('instanceId')
    return `[${id}] [${new Date().toISOString()}] [${type}] ${text}` + os.EOL
  }
}
