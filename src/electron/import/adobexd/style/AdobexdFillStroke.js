import AdobexdStyle from '../AdobexdStyle.js'
import AdobexdCommon from '../AdobexdCommon.js'
import ImportImage from '../../ImportImage.js'
import File from '../../../file/File.js'
import ExtendJS from '../../../../js/helper/ExtendJS.js'

export default {
  // there's only one fill
  async getFills (data, node, settings) {
    if (!node.style?.fill) return
    const record = { type: this.getType(node.style.fill) }
    await this.processFillType(node.style.fill, record, data, settings)
    if (record.type) return [record]
  },

  getType (entry) {
    if (entry.gradient && entry.gradient.meta.ux.gradientResources.type === 'linear') {
      return 'linear-gradient'
    } else if (entry.gradient) {
      // type can be radial or angular, but we process both types as radial
      return 'radial-gradient'
    } else if (entry.type === 'solid') {
      return 'solid-color'
    } else if (entry.type === 'pattern') {
      return 'image'
    }
  },

  async processFillType (fill, record, data, settings) {
    switch (record.type) {
      case 'solid-color':
        return this.getFillSolid(fill, record)
      case 'linear-gradient':
        return this.getFillLinearGradient(fill, record)
      case 'radial-gradient':
        return this.getFillRadialGradient(fill, record)
      case 'image':
        return await this.getFillImage(fill, record, data, settings)
    }
  },

  getFillSolid (fill, record) {
    record.color = AdobexdStyle.getColor(fill.color)
  },

  getFillLinearGradient (fill, record) {
    // @todo gradient angle is not calculated correctly
    record.coords = {
      x1: fill.gradient.x1,
      x2: fill.gradient.x2,
      y1: fill.gradient.y1,
      y2: fill.gradient.y2
    }
    record.stops = this.getGradientStops(fill.gradient.meta.ux.gradientResources.stops)
  },

  getFillRadialGradient (fill, record) {
    // these coordinates are used by svg; @todo make use of them in css too
    // angular gradients have the meta coordinates
    record.coords = {
      cx: fill.gradient.cx || fill.gradient.meta.ux.x,
      cy: fill.gradient.cx || fill.gradient.meta.ux.y,
      r: fill.gradient.r || fill.gradient.meta.ux.rotation
    }
    record.stops = this.getGradientStops(fill.gradient.meta.ux.gradientResources.stops)
  },

  async getFillImage (fill, record, data, settings) {
    const image = {
      file: 'resources/' + fill.pattern.meta.ux.uid,
      ext: File.extname(fill.pattern.href, true),
      width: fill.pattern.width
    }
    record.image = await ImportImage.processLocalImages(image, data, settings)
    // the width and height are used by the svg builder
    record.width = fill.pattern.width
    record.height = fill.pattern.height
  },

  getGradientStops (stops) {
    const values = []
    for (const stop of stops) {
      // the alpha value also takes into account the element opacity automatically
      values.push({
        color: AdobexdStyle.getColor(stop.color),
        position: ExtendJS.roundToTwo(stop.offset)
      })
    }
    return values
  },

  async getStroke (data, node, settings) {
    if (!AdobexdCommon.isStrokeAvailable(data.desechType, node.style)) return
    const record = {
      size: Math.round(node.style.stroke.width),
      dash: node.style.stroke.dash,
      type: this.getType(node.style.stroke)
    }
    await this.processFillType(node.style.stroke, record, data, settings)
    return record
  }
}
