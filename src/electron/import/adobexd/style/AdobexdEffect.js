import AdobexdStyle from '../AdobexdStyle.js'

export default {
  getEffects (node) {
    if (!node.style?.filters) return
    const records = []
    for (const filter of node.style.filters) {
      if (filter.visible === false) continue
      const record = this.getEffect(filter)
      if (record) records.push(record)
    }
    if (records.length) return records
  },

  getEffect (filter) {
    const record = { type: this.getEffectType(filter) }
    this.processEffectType(filter, record)
    if (record.type) return record
  },

  getEffectType (filter) {
    // allow only object blur, ignore background blur
    if (filter.type === 'uxdesign#blur' && !filter.params.backgroundEffect) {
      return 'blur'
    } else if (filter.type === 'dropShadow' || filter.type === 'uxdesign#innerShadow') {
      return 'shadow'
    }
  },

  processEffectType (filter, record) {
    if (record.type === 'blur') {
      record.amount = Math.round(filter.params.blurAmount)
    } else if (record.type === 'shadow') {
      this.addShadow(filter.params, record)
    }
  },

  addShadow (params, record) {
    const shadow = (params.dropShadows || params.innerShadows)[0]
    record.inset = params.innerShadows
    record.color = AdobexdStyle.getColor(shadow.color)
    record.x = Math.round(shadow.dx)
    record.y = Math.round(shadow.dy)
    // this is reported as half the value so 3 is 1.5, which rounded becomes 2
    record.radius = Math.round(shadow.r)
  }
}
