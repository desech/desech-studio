import FigmaStyle from '../FigmaStyle.js'

export default {
  getEffects (node) {
    const records = []
    for (const filter of node.effects) {
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
    if (type === 'LAYER_BLUR' || type === 'BACKGROUND_BLUR') {
      return 'blur'
    } else { // DROP_SHADOW, INNER_SHADOW
      return 'shadow'
    }
  },

  processEffectType (filter, record) {
    if (record.type === 'blur') {
      record.amount = Math.round(filter.radius) + 'px'
    } else { // shadow
      this.addShadow(filter, record)
    }
  },

  addShadow (filter, record) {
    record.inset = (filter.type === 'INNER_SHADOW')
    record.color = FigmaStyle.getColor(filter)
    record.x = Math.round(filter.offset.x)
    record.y = Math.round(filter.offset.y)
    record.radius = Math.round(filter.radius)
    record.spread = Math.round(filter.spread) || 0
  }
}
