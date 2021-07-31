import fs from 'fs'
import { app } from 'electron'
import AdobexdCommon from './AdobexdCommon.js'
import ParseCommon from '../ParseCommon.js'
import EventMain from '../../event/EventMain.js'
import File from '../../file/File.js'
import ImportSvg from '../ImportSvg.js'

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

  parseSvgPaths (elements, data, paths = null) {
    // we need to go through all elements and fetch our exported svgs (path/compound/group)
    for (const element of elements) {
      if (ParseCommon.isHidden(element.visible)) continue
      if (['path', 'compound'].includes(element.shape?.type)) {
        this.parseSvgElement(element, data, paths)
      } else if (element.group?.children) {
        this.parseSvgParent(element, element.group.children, data, paths)
      }
    }
  },

  parseSvgElement (element, data, paths) {
    if (paths) {
      paths.push(element.shape.path)
    } else if (element.meta?.ux?.markedForExport) {
      data[element.id] = { paths: [element.shape.path] }
    }
  },

  parseSvgParent (element, children, data, paths) {
    if (paths) {
      this.parseSvgPaths(children, data, paths)
    } else if (element.meta?.ux?.markedForExport) {
      data[element.id] = { paths: [] }
      this.parseSvgPaths(children, data, data[element.id].paths)
    } else {
      this.parseSvgPaths(children, data)
    }
  },

  async getSvgContent (element, extra) {
    if (extra.data.type !== 'icon') return
    switch (element.shape?.type) {
      case 'polygon':
        return { content: await this.getSvgFromPolygon(element, extra) }
      case 'path': case 'compound':
        return { content: await this.getSvgFromPath(element, extra) }
      default: // group
        return { content: await this.getSvgFromGroup(element, extra) }
    }
  },

  async getSvgFromPath (element, extra) {
    // val.box has the x/y/width/height values in order, so we presume it's safe to just merge
    const val = extra.svgPaths[element.id]
    const viewBox = Object.values(val.box).join(' ')
    const gr = this.prepareDataForGradient(element)
    const bg = await this.prepareDataForImage(element, extra)
    return `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" ` +
      'xmlns:xlink="http://www.w3.org/1999/xlink">\n' +
      ImportSvg.getGradientNode(gr) + ImportSvg.getPatternNode(bg) +
      `<path d="${val.path}"${ImportSvg.getFillUrl(gr || bg)}/>\n` +
    '</svg>'
  },

  async getSvgFromPolygon (element, extra) {
    const gr = this.prepareDataForGradient(element)
    const bg = await this.prepareDataForImage(element, extra)
    return `<svg viewBox="0 0 ${extra.data.width} ${extra.data.height}" ` +
      'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n' +
      ImportSvg.getGradientNode(gr) + ImportSvg.getPatternNode(bg) +
      `<polygon points="${this.getPolygonPoints(element.shape.points)}"` +
        `${ImportSvg.getFillUrl(gr || bg)}/>\n` +
    '</svg>'
  },

  getPolygonPoints (points) {
    // shape['uxdesign#cornerRadius'] and shape ['uxdesign#starRatio'] are ignored
    const array = []
    for (const point of points) {
      array.push(Math.round(point.x) + ',' + Math.round(point.y))
    }
    return array.join(' ')
  },

  prepareDataForGradient (element) {
    const gr = element.style?.fill?.gradient
    if (!gr) return
    const type = (gr.meta.ux.gradientResources.type === 'linear') ? 'linear' : 'radial'
    return {
      type,
      id: ImportSvg.getGradientId(),
      stops: this.getGradientStops(gr.meta.ux.gradientResources.stops),
      coords: (type === 'linear') ? this.getCoordsLinear(gr) : this.getCoordsRadial(gr)
    }
  },

  getGradientStops (stops) {
    const data = []
    for (const stop of stops) {
      data.push({
        offset: stop.offset,
        color: AdobexdCommon.getColor(stop.color)
      })
    }
    return data
  },

  getCoordsLinear (gr) {
    return {
      x1: gr.x1,
      x2: gr.x2,
      y1: gr.y1,
      y2: gr.y2
    }
  },

  getCoordsRadial (gr) {
    // angular gradients have other coordinates
    return {
      cx: gr.cx || gr.meta.ux.x,
      cy: gr.cx || gr.meta.ux.y,
      r: gr.r || gr.meta.ux.rotation
    }
  },

  async prepareDataForImage (element, extra) {
    const p = element.style?.fill?.pattern
    if (!p) return
    return {
      id: ImportSvg.getGradientId(),
      width: p.width,
      height: p.height,
      image: await this.getImageBse64(element.style.fill, extra)
    }
  },

  async getImageBse64 (fill, extra) {
    const imagePath = 'resources/' + fill.pattern.meta.ux.uid
    const ext = File.extname(fill.pattern.href).substring(1)
    const data = await ParseCommon.processLocalImages(imagePath, ext, extra)
    return {
      ext,
      base64: fs.readFileSync(data.path).toString('base64')
    }
  },

  getCssFillStroke (type, element) {
    if (type !== 'icon' || !element.style) return
    const css = {}
    this.addCssStroke(element.style, css)
    this.addCssColor(element.style, css)
    return css
  },

  addCssStroke (style, css) {
    if (style.stroke?.width) css['stroke-width'] = style.stroke.width + 'px'
    if (style.stroke?.dash) css['stroke-dasharray'] = style.stroke.dash.join(' ')
  },

  addCssColor (style, css) {
    if (style.stroke?.type === 'solid') {
      css.stroke = AdobexdCommon.getColor(style.stroke.color)
    }
    if (style.fill?.type === 'solid') {
      css.fill = AdobexdCommon.getColor(style.fill.color)
    } else if (style.fill?.type === 'none') {
      css.fill = 'transparent'
    }
  }
}
