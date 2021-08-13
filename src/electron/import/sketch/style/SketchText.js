import ImportFont from '../../ImportFont.js'
import ExtendJS from '../../../../js/helper/ExtendJS.js'

export default {
  getText (style, data) {
    if (!style || data.desechType !== 'text') return
    const record = {}
    this.addStyle('fontFamily', this.getFontFamily(style), record)
    this.addStyle('fontSize', this.getFontSize(style), record)
    this.addStyle('fontWeight', this.getFontWeight(style), record)
    this.addStyle('fontStyle', this.getFontStyle(style), record)
    this.addStyle('lineHeight', this.getLineHeight(style), record)
    if (style.kerning) record.letterSpacing = Math.round(style.kerning) + 'px'
    this.addStyle('textTransform', this.getTextTransform(style), record)
    this.addStyle('textAlign', this.getTextAlign(style), record)
    this.addStyle('alignSelf', this.getAlignSelf(style), record)
    this.addStyle('verticalAlign', this.getVerticalAlign(style), record)
    this.addStyle('textDecoration', this.getTextDecoration(style), record)
    if (!ExtendJS.isEmpty(record)) return record
  },

  addStyle (name, value, record) {
    if (value) record[name] = value
  },

  getFontFamily (style) {
    const name = this.getFontName(style)
    if (!name) return
    // example = ShadowsIntoLightTwo-Regular
    const font = name.substring(0, name.indexOf('-'))
    return font.replace(/([A-Z]+)/g, ' $1').trim()
  },

  getFontName (style) {
    const value = style?.MSAttributedStringFontAttribute?.attributes?.name
    if (value) return value
  },

  getFontSize (style) {
    const value = style?.MSAttributedStringFontAttribute?.attributes?.size
    if (value) return value
  },

  getFontWeight (style) {
    const name = this.getFontName(style)
    if (!name) return
    // example = ShadowsIntoLightTwo-ExtraLightItalic
    const weight = name.substring(name.indexOf('-') + 1).replace('Italic', '').toLowerCase()
    return ImportFont.getWeight(weight)
  },

  getFontStyle (style) {
    const font = this.getFontName(style)
    if (font && font.indexOf('Italic') > 0) return 'italic'
  },

  getLineHeight (style) {
    const value = style?.paragraphStyle?.maximumLineHeight
    if (value) return Math.round(value)
  },

  getTextTransform (style) {
    const value = style?.MSAttributedStringTextTransformAttribute
    // title case is only supported by lunacy with "com.icons8.lunacy" and "isTitleCase"
    const transforms = { 1: 'uppercase', 2: 'lowercase' }
    if (value) return transforms[value]
  },

  getTextAlign (style) {
    const value = style?.paragraphStyle?.alignment
    const aligns = { 0: 'left', 1: 'right', 2: 'center', 3: 'justify' }
    // this will skip the 0 value which is `left`, which is what we want
    if (value && aligns[value]) return aligns[value]
  },

  getAlignSelf (style) {
    const value = style?.textStyleVerticalAlignmentKey
    const aligns = { 0: 'start', 1: 'center', 2: 'end' }
    // this will skip the 0 value which is `start`, which is what we want
    if (value && aligns[value]) return aligns[value]
  },

  getVerticalAlign (style) {
    switch (style?.NSSuperScript) {
      case 1:
        return 'super'
      case -1:
        return 'sub'
    }
  },

  getTextDecoration (style) {
    const value = []
    if (style?.underlineStyle) value.push('underline')
    if (style?.strikethroughStyle) value.push('line-through')
    return value.join(' ')
  }
}
