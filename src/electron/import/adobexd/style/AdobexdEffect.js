import AdobexdStyle from '../AdobexdStyle.js'

export default {
  getEffects (node) {
    if (!node.style?.filters) return
    const records = []
    for (const filter of node.style.filters) {
      if (filter.visible === false) continue
      const record = this.getEffect(filter)
      records.push(record)
    }
    if (records.length) return records
  },

  getEffect (filter) {
    const record = { type: this.getEffectType(filter.type) }
    this.processEffectType(filter, record)
    return record
  },

  getEffectType (type) {
    return (type === 'uxdesign#blur') ? 'blur' : 'shadow'
  },

  processEffectType (filter, record) {
    if (record.type === 'blur') {
      // allow only object blur, ignore background blur
      record.amount = Math.round(filter.params.blurAmount)
    } else { // shadow
      this.addShadow(filter.params, record)
    }
  },

  addShadow (params, record) {
    const shadow = (params.dropShadows || params.innerShadows)[0]
    record.inset = params.innerShadows
    record.color = AdobexdStyle.getColor(shadow.color)
    record.x = Math.round(shadow.dx)
    record.y = Math.round(shadow.dy)
    record.radius = Math.round(shadow.r)
  }
}
