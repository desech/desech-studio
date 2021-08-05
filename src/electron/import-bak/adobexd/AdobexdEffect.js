import AdobexdCommon from './AdobexdCommon.js'

export default {
  getCssEffect (desechType, element) {
    const effects = { 'box-shadow': [], filter: [] }
    this.addOpacity(element.style.opacity, effects)
    this.addFilters(desechType, element.style.filters, effects)
    return this.returnEffects(element, effects)
  },

  addOpacity (opacity, effects) {
    if (typeof opacity === 'undefined') return
    const value = Math.round(opacity * 100)
    effects.filter.push(`opacity(${value}%)`)
  },

  addFilters (desechType, filters, effects) {
    if (!filters) return
    for (const filter of filters) {
      this.processEffect(desechType, filter, effects)
    }
  },

  processEffect (desechType, filter, effects) {
    if (filter.visible === false) return
    if (filter.type === 'dropShadow') {
      this.addShadow(desechType, filter.params.dropShadows[0], false, effects)
    } else if (filter.type === 'uxdesign#innerShadow') {
      this.addShadow(desechType, filter.params.innerShadows[0], true, effects)
    } else if (filter.type === 'uxdesign#blur') {
      this.addBlur(filter.params, effects)
    }
  },

  addShadow (type, shadow, isInner, effects) {
    const data = this.getShadowData(shadow)
    const inner = isInner ? ' inset' : ''
    if (type === 'text') {
      const value = `drop-shadow(${data.color} ${data.x}px ${data.y}px ${data.radius}px${inner})`
      effects.filter.push(value)
    } else {
      const value = `${data.color} ${data.x}px ${data.y}px ${data.radius}px 0px${inner}`
      effects['box-shadow'].push(value)
    }
  },

  getShadowData (shadow) {
    return {
      color: AdobexdCommon.getColor(shadow.color),
      x: Math.round(shadow.dx),
      y: Math.round(shadow.dy),
      radius: Math.round(shadow.r)
    }
  },

  addBlur (blur, effects) {
    // allow only object blur, ignore background blur
    if (blur.backgroundEffect) return
    const value = `blur(${Math.round(blur.blurAmount)}px)`
    effects.filter.push(value)
  },

  returnEffects (element, effects) {
    return {
      ...this.getEffectProperty(effects, 'filter', ' '),
      ...this.getEffectProperty(effects, 'box-shadow', ', '),
      ...this.addRotation(Math.round(element.meta.ux.rotation)),
      ...this.addCssMixBlendMode(element.style.blendMode)
    }
  },

  getEffectProperty (effects, type, glue) {
    return effects[type].length ? { [type]: effects[type].join(glue) } : null
  },

  addRotation (angle) {
    return angle ? { transform: `rotateX(0deg) rotateY(0deg) rotateZ(${angle}deg)` } : null
  },

  addCssMixBlendMode (value) {
    // normal, darken, multiply, color-burn, lighten, screen, color-dodge, overlay, soft-light,
    // hard-light, difference, exclusion, hue, saturation, color, luminosity
    return value ? { 'mix-blend-mode': value } : null
  }
}
