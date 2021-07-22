import fs from 'fs'
import { app } from 'electron'
import AdobexdCommon from './AdobexdCommon.js'
import ParseCommon from '../ParseCommon.js'
import EventMain from '../../event/EventMain.js'
import File from '../../file/File.js'

export default {
  async prepareSvgPaths (elements) {
    const data = {}
    this.parseSvgPaths(elements, data)
    // we execute a js script on the browser because we can't use ipc `send` to return a value
    const file = File.resolve(app.getAppPath(), 'scriptParseSvg.js')
    const code = fs.readFileSync(file).toString()
      .replace('{{DATA}}', JSON.stringify(data))
    return await EventMain.executeJs(code)
  },

  parseSvgPaths (elements, data) {
    for (const element of elements) {
      if (ParseCommon.isHidden(element.visible)) continue
      if (element.type === 'shape' && ['path', 'compound'].includes(element.shape.type) &&
        element.meta.ux.markedForExport) {
        data[element.id] = { path: element.shape.path }
      } else if (element.group?.children) {
        this.parseSvgPaths(element.group.children, data)
      } else if (element.shape?.children) {
        this.parseSvgPaths(element.shape.children, data)
      }
    }
  },

  getSvgContent (element, type, width, height, svgPaths) {
    if (type !== 'icon') return
    const content = element.shape.path
      ? this.getSvgFromPath(svgPaths[element.id])
      : this.getSvgFromPolygon(element, width, height)
    return { content }
  },

  getSvgFromPath (val) {
    // val.box has the x/y/width/height values in order, so we presume it's safe to just merge
    const viewBox = Object.values(val.box).join(' ')
    return `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">` +
      `<path d="${val.path}"/>` +
    '</svg>'
  },

  getSvgFromPolygon (element, width, height) {
    const p = element.shape.points
    return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">` +
      `<polygon points="${parseInt(p[0].x)},${parseInt(p[0].y)} ` +
        `${parseInt(p[1].x)},${parseInt(p[1].y)} ` +
        `${parseInt(p[2].x)},${parseInt(p[2].y)}"/>` +
    '</svg>'
  },

  getCssFillStroke (type, element) {
    if (type !== 'icon') return
    const css = {}
    if (element.style?.stroke?.width) {
      css['stroke-width'] = element.style.stroke.width + 'px'
    }
    if (element.style?.stroke?.type === 'solid') {
      css.stroke = AdobexdCommon.getColor(element.style.stroke.color)
    }
    if (element.style?.fill?.type === 'solid') {
      css.fill = AdobexdCommon.getColor(element.style.fill.color)
    }
    return css
  }
}
