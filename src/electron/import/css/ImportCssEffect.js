export default {
  addCssEffects (element, rules) {
    const list = { filter: [], 'box-shadow': [] }
    this.addTransformRotation(element.style.rotation, rules)
    if (element.style.blendMode) rules['mix-blend-mode'] = element.style.blendMode
    this.addEffectOpacity(element.style.opacity, list.filter)
    this.addGeneralEffects(element.desechType, element.style.effects, list)
    this.addListEffects(list, rules)
  },

  addTransformRotation (rotation, rules) {
    if (rotation) {
      rules.transform = `rotateX(0deg) rotateY(0deg) rotateZ(${rotation}deg)`
    }
  },

  addEffectOpacity (opacity, filter) {
    if (typeof opacity === 'undefined') return
    const value = Math.round(opacity * 100)
    filter.push(`opacity(${value}%)`)
  },

  addGeneralEffects (desechType, effects, list) {
    if (!effects) return
    for (const effect of effects) {
      this.addEffect(desechType, effect, list)
    }
  },

  addEffect (desechType, effect, list) {
    switch (effect.type) {
      case 'shadow':
        this.addShadowEffect(desechType, effect, list)
        break
      case 'blur': case 'brightness': case 'saturate': case 'contrast': case 'hue-rotate':
        list.filter.push(`${effect.type}(${effect.amount})`)
        break
    }
  },

  addShadowEffect (desechType, e, list) {
    if (desechType === 'text' || desechType === 'icon') {
      const value = `drop-shadow(${e.color} ${e.x}px ${e.y}px ${e.radius}px)`
      list.filter.push(value)
    } else {
      const inner = e.inset ? ' inset' : ''
      const value = `${e.color} ${e.x}px ${e.y}px ${e.radius}px ${(e.spread || 0)}px${inner}`
      list['box-shadow'].push(value)
    }
  },

  addListEffects (list, rules) {
    for (const property in list) {
      if (!list[property].length) continue
      const glue = (property === 'filter') ? ' ' : ', '
      rules[property] = list[property].join(glue)
    }
  }
}
