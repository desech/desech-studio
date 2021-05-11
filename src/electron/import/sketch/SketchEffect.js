import SketchCommon from './SketchCommon.js'
import ParseCommon from '../ParseCommon.js'

export default {
  getCssEffect (elemType, element) {
    const effects = { 'box-shadow': [], filter: [] }
    this.addBitmapEffects(effects.filter, element)
    this.addEffectRecords(effects, elemType, element.style)
    return this.mergeEffects(effects)
  },

  addBitmapEffects (filterEffects, element) {
    if (!element.style.colorControls || element._class !== 'bitmap') return
    const controls = element.style.colorControls
    // -1, 0, 1 <--> 0, 1, 2
    this.addFilterValue('brightness', controls.brightness + 1, 1, filterEffects)
    // 0, 1, 2 <--> 0, 1, 2
    this.addFilterValue('saturate', controls.saturation, 1, filterEffects)
    // 0, 1, 4 <--> 0, 1, 4
    this.addFilterValue('contrast', controls.contrast, 1, filterEffects)
    // -3.14, 0, 3.14 <--> -3.14rad, 0rad, 3.14rad
    this.addFilterValue('hue-rotate', controls.hue + 'rad', '0rad', filterEffects)
  },

  addFilterValue (name, value, neutral, filterEffects) {
    if (value === neutral) return
    const record = this.getFilterRecord(name, value)
    filterEffects.push(record)
  },

  addEffectRecords (effects, elemType, style) {
    let styleEffects = []
    if (style.blur) styleEffects.push(style.blur)
    if (style.shadows) styleEffects = [...styleEffects, ...style.shadows]
    if (style.innerShadows) styleEffects = [...styleEffects, ...style.innerShadows]
    for (const effect of styleEffects) {
      this.processEffect(effects, elemType, effect)
    }
  },

  processEffect (effects, elemType, effect) {
    if (!effect.isEnabled) return
    const data = this.getEffectData(elemType, effect)
    const record = (data.type === 'filter')
      ? this.getFilter(effect, data)
      : this.getBoxShadow(effect)
    if (record) effects[data.type].push(record)
  },

  getEffectData (elemType, effect) {
    const effectType = this.getEffectType(effect)
    if (elemType === 'text') {
      return { type: 'filter', method: effectType }
    } else {
      return {
        type: (effectType === 'blur') ? 'filter' : 'box-shadow',
        method: (effectType === 'blur') ? 'blur' : null
      }
    }
  },

  getEffectType (effect) {
    if (effect._class === 'blur') {
      return 'blur'
    } else {
      // shadow, innerShadow
      return 'drop-shadow'
    }
  },

  getFilter (effect, data) {
    if (data.method === 'blur') {
      // 0 = gaussian blur, 3 = background blur
      if (effect.type !== 0) return null
      return this.getFilterRecord('blur', Math.round(effect.radius) + 'px')
    } else {
      // drop-shadow
      return this.getFilterRecord('drop-shadow', this.getFilterShadow(effect))
    }
  },

  getFilterRecord (type, value) {
    return { filter: `${type}(${value})` }
  },

  getFilterShadow (effect) {
    const data = this.getShadowData(effect)
    return `${data.color} ${data.x}px ${data.y}px ${data.radius}px`
  },

  getShadowData (effect) {
    return {
      color: SketchCommon.getColor(effect.color),
      x: Math.round(effect.offsetX),
      y: Math.round(effect.offsetY),
      radius: Math.round(effect.blurRadius),
      spread: Math.round(effect.spread)
    }
  },

  getBoxShadow (effect) {
    const data = this.getShadowData(effect)
    const inner = (effect._class === 'innerShadow') ? ' inset' : ''
    return {
      'box-shadow': `${data.color} ${data.x}px ${data.y}px ${data.radius}px ` +
        `${data.spread}px${inner}`
    }
  },

  mergeEffects (effects) {
    return {
      ...ParseCommon.mergeValues(effects.filter, ' '),
      ...ParseCommon.mergeValues(effects['box-shadow'], ' ')
    }
  }
}
