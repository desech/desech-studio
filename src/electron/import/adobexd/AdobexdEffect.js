import AdobexdCommon from './AdobexdCommon.js'

export default {
  getCssEffect (type, effects) {
    if (!effects) return
    const props = {}
    for (const effect of effects) {
      this.addEffect(type, effect, props)
    }
    return props
  },

  addEffect (type, effect, props) {
    if (effect.visible === false) return
    if (effect.type === 'dropShadow') this.addShadow(type, effect.params.dropShadows[0], props)
    if (effect.type === 'uxdesign#blur') this.addBlur(effect.params, props)
  },

  addShadow (type, shadow, props) {
    const data = this.getShadowData(shadow)
    if (type === 'text') {
      props.filter = `drop-shadow(${data.color} ${data.x}px ${data.y}px ${data.radius}px)`
    } else {
      props['box-shadow'] = `${data.color} ${data.x}px ${data.y}px ${data.radius}px`
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

  addBlur (blur, props) {
    if (blur.backgroundEffect) return
    props.filter = props.filter || ''
    props.filter += ` blur(${Math.round(blur.blurAmount)}px)`
    props.filter = props.filter.trim()
  }
}
