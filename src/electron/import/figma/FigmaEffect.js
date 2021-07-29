import FigmaCommon from './FigmaCommon.js'
import ParseCommon from '../ParseCommon.js'

export default {
  getCssEffect (desechType, element) {
    if (desechType === 'block' && element.exportSettings?.length) return
    const effects = { 'box-shadow': [], filter: [] }
    this.addOpacity(element.opacity, effects)
    for (const effect of element.effects) {
      this.processEffect(desechType, effect, effects)
    }
    return this.returnEffects(element, effects)
  },

  addOpacity (opacity, effects) {
    if (typeof opacity === 'undefined') return
    const value = Math.round(opacity * 100)
    effects.filter.push({ filter: `opacity(${value}%)` })
  },

  processEffect (desechType, effect, effects) {
    if (effect.visible === false) return
    const data = this.getEffectData(desechType, effect)
    const record = (data.type === 'filter')
      ? this.getFilter(effect, data)
      : this.getBoxShadow(effect)
    if (record) effects[data.type].push(record)
  },

  getEffectData (desechType, effect) {
    const effectType = this.getEffectType(effect)
    if (desechType === 'text' || desechType === 'icon') {
      return { type: 'filter', method: effectType }
    } else {
      return {
        type: (effectType === 'blur') ? 'filter' : 'box-shadow',
        method: (effectType === 'blur') ? 'blur' : null
      }
    }
  },

  getEffectType (effect) {
    if (effect.type === 'LAYER_BLUR' || effect.type === 'BACKGROUND_BLUR') {
      return 'blur'
    } else {
      // DROP_SHADOW, INNER_SHADOW
      return 'drop-shadow'
    }
  },

  getFilter (effect, data) {
    if (data.method === 'blur') {
      return { filter: this.getFilterBlur(effect) }
    } else {
      // drop-shadow
      return { filter: this.getFilterShadow(effect) }
    }
  },

  getFilterBlur (effect) {
    return `blur(${Math.round(effect.radius)}px)`
  },

  getFilterShadow (effect) {
    const data = this.getShadowData(effect)
    // drop-shadow has no spread, only box-shadow
    return `drop-shadow(${data.color} ${data.x}px ${data.y}px ${data.radius}px)`
  },

  getShadowData (effect) {
    return {
      color: FigmaCommon.getColor(effect.color.r, effect.color.g, effect.color.b, effect.color.a),
      x: Math.round(effect.offset.x),
      y: Math.round(effect.offset.y),
      radius: Math.round(effect.radius),
      spread: Math.round(effect.spread) || 0
    }
  },

  getBoxShadow (effect) {
    const data = this.getShadowData(effect)
    const inner = (effect.type === 'INNER_SHADOW') ? ' inset' : ''
    return {
      'box-shadow': `${data.color} ${data.x}px ${data.y}px ${data.radius}px ` +
        `${data.spread}px${inner}`
    }
  },

  returnEffects (element, effects) {
    return {
      ...ParseCommon.mergeValues(effects.filter, ' '),
      ...ParseCommon.mergeValues(effects['box-shadow'], ', '),
      ...this.addCssMixBlendMode(element.blendmode)
    }
  },

  addCssMixBlendMode (mode) {
    if (!mode) return
    const value = FigmaCommon.getBlendMode(mode)
    if (value === 'normal') return
    return { 'mix-blend-mode': value }
  },

  getProperties () {
    return ['box-shadow', 'filter']
  }
}
