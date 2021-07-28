import fs from 'fs'
import fetch from 'node-fetch'
import ParseCommon from '../ParseCommon.js'
import EventMain from '../../event/EventMain.js'
import Language from '../../lib/Language.js'
import File from '../../file/File.js'

export default {
  async apiCall (method, token) {
    const msg = Language.localize('Fetching <b>{{method}}</b>', { method })
    EventMain.ipcMainInvoke('mainImportProgress', msg)
    const res = await this.getResponse(method, token)
    const json = await res.json()
    if (json.error) this.error(json.message, res, method)
    if (json.err) this.error(json.err, res, method)
    return json
  },

  async getResponse (method, token) {
    const headers = { headers: { Authorization: `Bearer ${token}` } }
    const url = `https://api.figma.com/v1/${method}`
    const response = await fetch(url, headers)
    if (!response.ok) throw new Error(Language.localize("Can't access api.figma.com"))
    return response
  },

  error (error, res, method) {
    throw new Error(`Url: ${method}, Status: ${res.status}, Error: ${error}`)
  },

  getObjectColor (obj) {
    const opacity = obj.opacity || obj.color.a
    return this.getColor(obj.color.r, obj.color.g, obj.color.b, opacity)
  },

  getColor (red, green, blue, alpha) {
    const rgb = [Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255)]
    return ParseCommon.getColor(rgb, alpha)
  },

  getWidth (elementType, element) {
    // don't add the stroke size to the width when processing lines
    const extra = (element.type !== 'LINE') ? this.getExtraVolume(elementType, element) : 0
    return Math.round(element.absoluteBoundingBox.width + extra)
  },

  getHeight (elementType, element, addExtra = true) {
    const extra = addExtra ? this.getExtraVolume(elementType, element) : 0
    return Math.round(element.absoluteBoundingBox.height + extra)
  },

  getExtraVolume (elementType, element) {
    const stroke = this.getStroke(elementType, element)
    return ParseCommon.getExtraVolume(elementType, stroke)
  },

  getStroke (elementType, element) {
    if (!this.isStrokeAvailable(elementType, element.strokes)) return {}
    return {
      type: element.strokeAlign.toLowerCase(),
      size: element.strokeWeight
    }
  },

  isStrokeAvailable (elementType, strokes) {
    if (elementType === 'icon' || elementType === 'text') return false
    if (!strokes || !strokes.length) return false
    if (strokes.length === 1 && strokes[0].visible === false) return false
    return true
  },

  getCssBasic (type, element) {
    const css = {}
    if (type === 'text' || type === 'inline') return css
    css.width = this.getWidth(type, element) + 'px'
    const height = this.getHeight(type, element)
    css.height = height + 'px'
    ParseCommon.setBlockMinHeight(type, height, css)

    // @todo angle value is not calculated correctly - find the correct formula
    // const m = element.relativeTransform
    // console.log(element.name, Math.atan2(-m[1][0], m[0][0]))
    return css
  },

  getCssMixBlendMode (mode) {
    if (!mode) return
    const value = this.getBlendMode(mode)
    if (value === 'normal') return
    return { 'mix-blend-mode': value }
  },

  getBlendMode (mode) {
    if (!mode) return 'normal'
    return mode.toLowerCase().replace('_', '-').replace('linear', 'color')
      .replace('pass-through', 'normal')
    // PASS_THROUGH, NORMAL => normal
    // DARKEN => darken
    // MULTIPLY => multiply
    // LINEAR_BURN, COLOR_BURN => color-burn
    // LIGHTEN => lighten
    // SCREEN => screen
    // LINEAR_DODGE, COLOR_DODGE => color-dodge
    // OVERLAY => overlay
    // SOFT_LIGHT => soft-light
    // HARD_LIGHT => hard-light
    // DIFFERENCE => difference
    // EXCLUSION => exclusion
    // HUE => hue
    // SATURATION => saturation
    // COLOR => color
    // LUMINOSITY => luminosity
  },

  getCssRoundedCorners (element) {
    if (element.type === 'ELLIPSE') return ParseCommon.getCircleRoundedBorders()
    let rect = []
    if (element.rectangleCornerRadii) {
      rect = element.rectangleCornerRadii
    } else if (element.cornerRadius) {
      const val = element.cornerRadius
      rect = [val, val, val, val]
    } else {
      return
    }
    return ParseCommon.getRoundedBorders(rect)
  },

  // data = elementId, fileName, fileExt, scale, existingImages, folder, projectFile, token
  async processImageFile (data) {
    const file = this.imageExists(data.existingImages, data.fileName + '.' + data.fileExt)
    if (file) {
      return { file, content: fs.readFileSync(file).toString() }
    } else {
      return await this.downloadImageFile(data)
    }
  },

  imageExists (images, image) {
    for (const entry of images) {
      if (entry.name.startsWith(image)) return entry.path
    }
  },

  async downloadImageFile (data) {
    const url = `images/${data.projectFile}?ids=${data.elementId}&scale=${data.scale}` +
      `&format=${data.fileExt}`
    const json = await this.apiCall(url, data.token)
    const file = File.resolve(data.folder, data.fileName + '.' + data.fileExt)
    let content
    if (!json.images[data.elementId]) {
      content = this.saveEmptyImage(file)
    } else {
      content = await this.saveApiImage(json.images[data.elementId], file, data.fileExt)
    }
    return { file, content }
  },

  saveEmptyImage (file) {
    const msg = Language.localize('<span class="error">Image is empty</span>')
    EventMain.ipcMainInvoke('mainImportProgress', msg)
    // save the empty image so we don't call the api url again
    fs.writeFileSync(file, '')
    return ''
  },

  async saveApiImage (url, file, ext) {
    const response = await fetch(url)
    if (!response.ok) throw new Error(Language.localize("Can't access the figma image"))
    const content = (ext === 'svg') ? await response.text() : await response.buffer()
    fs.writeFileSync(file, content)
    return content
  }
}
