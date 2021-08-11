import fs from 'fs'
import { app } from 'electron'
import ImportIcon from '../ImportIcon.js'
import File from '../../file/File.js'
import EventMain from '../../event/EventMain.js'

export default {
  async addSvgContent (data, node, settings) {
    if (data.desechType !== 'icon') return
    const nodeContent = this.getSvgNodeContent(data, node)
    const svgContent = ImportIcon.buildSvgContent(data, nodeContent)
    const viewBox = await this.getSvgViewBox(data, svgContent)
    data.content = ImportIcon.getSvgCode(viewBox, svgContent)
  },

  getSvgNodeContent (data, node) {
    if (data.designType === 'polygon') {
      const points = this.getPolygonPoints(node.shape.points)
      return `polygon points="${points}"`
    } else {
      // path, compound; can't be anything else because only these shapes can be icons
      return `path d="${node.shape.path}"`
    }
  },

  getPolygonPoints (points) {
    // shape['uxdesign#cornerRadius'] and shape ['uxdesign#starRatio'] are ignored
    const array = []
    for (const point of points) {
      array.push(Math.round(point.x) + ',' + Math.round(point.y))
    }
    return array.join(' ')
  },

  async getSvgViewBox (data, content) {
    if (data.designType === 'polygon') {
      return `0 0 ${data.width} ${data.height}`
    } else { // path, compound
      return await this.calculateSvgViewBox(data, content)
    }
  },

  // we execute a js script on the browser because we can't use ipc `send` to return a value
  async calculateSvgViewBox (data, content) {
    const file = File.resolve(app.getAppPath(), 'scriptParseSvg.js')
    const code = fs.readFileSync(file).toString().replace('{{CONTENT}}', content)
    const viewBox = await EventMain.executeJs(code)
    this.adjustDimensions(data, viewBox)
    return Object.values(viewBox).join(' ')
  },

  // now that we have the correct x/y/w/h let's update our data values
  adjustDimensions (data, viewBox) {
    data.x += viewBox.x
    data.y += viewBox.y
    data.width += viewBox.width
    data.height += viewBox.height
  }
}
