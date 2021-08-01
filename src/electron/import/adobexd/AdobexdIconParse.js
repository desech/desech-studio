import fs from 'fs'
import { app } from 'electron'
import EventMain from '../../event/EventMain.js'
import ParseCommon from '../ParseCommon.js'
import File from '../../file/File.js'
import AdobexdIcon from './AdobexdIcon.js'

export default {
  async prepareSvgData (elements, extra) {
    const data = {}
    await this.parseAddSvgInner(elements, data, extra)
    return await this.parseAddSvgViewBox(data)
  },

  async parseAddSvgInner (elements, data, extra, innerNodes = null) {
    // we need to go through all elements and fetch our exported icons
    for (const element of elements) {
      if (ParseCommon.isHidden(element.visible)) continue
      if (['polygon', 'path', 'compound'].includes(element.shape?.type)) {
        await this.parseSvgElement(element, data, extra, innerNodes)
      } else if (element.group?.children) {
        await this.parseSvgParent(element, element.group.children, data, extra, innerNodes)
      }
    }
  },

  async parseSvgElement (element, data, extra, innerNodes) {
    if (!innerNodes && !element.meta?.ux?.markedForExport) return
    const node = await AdobexdIcon.getSvgNode(element, extra, !!innerNodes)
    if (innerNodes) {
      // inner node inside icon
      innerNodes.push(node)
    } else if (element.meta?.ux?.markedForExport) {
      // stand alone exported node; the polygon doesn't need the viewbox calculation
      data[element.id] = {
        needsViewBox: (element.shape?.type !== 'polygon'),
        nodes: [node]
      }
    }
  },

  async parseSvgParent (element, children, data, extra, innerNodes) {
    if (innerNodes) {
      // inner group inside icon
      await this.parseAddSvgInner(children, data, extra, innerNodes)
    } else if (element.meta?.ux?.markedForExport) {
      // stand alone exported group
      data[element.id] = { needsViewBox: true, nodes: [] }
      await this.parseAddSvgInner(children, data, extra, data[element.id].nodes)
    } else {
      // a regular group without export and not inside an icon
      await this.parseAddSvgInner(children, data, extra)
    }
  },

  async parseAddSvgViewBox (data) {
    // we execute a js script on the browser because we can't use ipc `send` to return a value
    const file = File.resolve(app.getAppPath(), 'scriptParseSvg.js')
    const code = fs.readFileSync(file).toString().replace('{{DATA}}', JSON.stringify(data))
    return await EventMain.executeJs(code)
  }
}
