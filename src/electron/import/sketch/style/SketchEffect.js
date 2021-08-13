import SketchStyle from '../SketchStyle.js'
import ExtendJS from '../../../../js/helper/ExtendJS.js'

export default {
  getEffects (style) {
    const records = []
    this.addBlurEffect(style?.blur, records)
    this.addShadows(style?.shadows, records)
    this.addShadows(style?.innerShadows, records)
    this.addBitmapEffects(style?.colorControls, records)
    if (records.length) return records
  },

  addBlurEffect (blur, records) {
    // 0 = gaussian blur (don't want it), 3 = background blur
    if (!blur || blur.type === 0) return
    records.push({
      type: 'blur',
      amount: Math.round(blur.radius)
    })
  },

  addShadows (shadows, records) {
    if (!shadows) return
    for (const shadow of shadows) {
      if (shadow.isEnabled) {
        records.push(this.getShadow(shadow))
      }
    }
  },

  getShadow (shadow) {
    return {
      type: 'shadow',
      inset: (shadow._class === 'innerShadow'),
      color: SketchStyle.getColor(shadow.color),
      x: Math.round(shadow.offsetX),
      y: Math.round(shadow.offsetY),
      radius: Math.round(shadow.blurRadius),
      spread: Math.round(shadow.spread)
    }
  },

  addBitmapEffects (controls, records) {
    if (!controls) return
    // -1, 0, 1 <--> 0, 1, 2
    this.addBitmapFilter('brightness', controls.brightness + 1, 1, records)
    // 0, 1, 2 <--> 0, 1, 2
    this.addBitmapFilter('saturate', controls.saturation, 1, records)
    // 0, 1, 4 <--> 0, 1, 4
    this.addBitmapFilter('contrast', controls.contrast, 1, records)
    // -3.14, 0, 3.14 <--> -3.14, 0, 3.14
    this.addBitmapFilter('hue-rotate', controls.hue, 0, records)
  },

  addBitmapFilter (type, value, neutral, records) {
    if (value === neutral) return
    const amount = (type === 'hue-rotate')
      ? ExtendJS.roundToTwo(value) + 'rad'
      : Math.round(value * 100) + '%'
    records.push({ type, amount })
  }
}
