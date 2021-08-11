import ExtendJS from '../../../../js/helper/ExtendJS.js'

export default {
  getText (style, data) {
    if (data.designType !== 'text') return
    const record = {}
    if (style.font?.family) record.fontFamily = style.font.family
    if (style.font?.size) record.fontSize = Math.round(style.font.size)
    if (style.font?.style?.includes('Bold')) record.fontWeight = '700'
    if (style.font?.style?.includes('Italic')) record.fontStyle = 'italic'
    this.addLineHeight(style, record)
    this.addLetterSpacing(style, record)
    this.addTextTransform(style, record)
    this.addTextAlign(style, record)
    this.addVerticalAlign(style, record)
    this.addTextDecoration(style, record)
    if (!ExtendJS.isEmpty(record)) return record
  },

  addLineHeight (style, record) {
    if (style.textAttributes?.lineHeight) {
      record.lineHeight = Math.round(style.textAttributes.lineHeight)
    }
  },

  addLetterSpacing (style, record) {
    const value = style.textAttributes?.letterSpacing
    const number = ExtendJS.roundToTwo(value / 1000)
    if (number) record.letterSpacing = number + 'em'
  },

  // @todo wait for adobe to add textTransform to `style` too, not just `rangedStyles`
  addTextTransform (style, record) {
    if (style.textTransform) {
      record.textTransform = style.textTransform.replace('titlecase', 'capitalize')
    }
  },

  addTextAlign (style, record) {
    // default align left is not added, so we don't have to worry about it
    if (style.textAttributes?.paragraphAlign) {
      record.textAlign = style.textAttributes.paragraphAlign
    }
  },

  // @todo wait for adobe to add verticalAlign to `style` too
  // right now it only works with inline text
  addVerticalAlign (style, record) {
    const value = style.textAttributes?.verticalAlign
    if (value) record.verticalAlign = (parseInt(value) < 0) ? 'sub' : 'sup'
  },

  // @todo wait for adobe to add decoration to `style` too
  // right now it only works with inline text
  addTextDecoration (style, record) {
    const values = style.textAttributes?.decoration
    if (values?.length) record.textDecoration = values.join(' ')
  }
}
